import fs from 'node:fs/promises'
import path from 'node:path'
import { execa } from 'execa'
import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'

const BACKUP_RETENTION_DAYS = 3

export default defineTask({
  meta: {
    name: 'db:backup',
    description: 'Dump database and upload to S3 daily',
  },
  async run() {
    const now = new Date()
    const timestamp = now.toISOString().split('T')[0] // YYYY-MM-DD
    const backupFileName = `backup-${timestamp}.sql.gz`
    const localBackupPath = path.join('/tmp', backupFileName)

    // S3 Environment Variables
    const s3Bucket = process.env.AWS_S3_BUCKET
    const s3Region = process.env.AWS_S3_REGION
    const s3AccessKey = process.env.AWS_S3_ACCESS_KEY
    const s3SecretKey = process.env.AWS_S3_SECRET_ACCESS_KEY

    if (!s3Bucket || !s3Region || !s3AccessKey || !s3SecretKey) {
      console.error('S3 environment variables are not fully configured. Skipping backup.')
      return { result: 'Error: Missing S3 environment variables' }
    }

    // Database Environment Variables
    const postgresUrl = process.env.POSTGRES_URL
    const dbHost = process.env.POSTGRES_HOST
    const dbPort = process.env.POSTGRES_PORT
    const dbUser = process.env.POSTGRES_USER
    const dbPassword = process.env.POSTGRES_PASSWORD
    const dbName = process.env.POSTGRES_DB

    let pgDumpBaseCommand: string
    const pgDumpExecaOptions: { shell: true, env: Record<string, string> } = { shell: true, env: {} }

    if (postgresUrl) {
      // Escape single quotes in the URL for shell safety, though pg_dump expects a raw URL.
      // The primary concern is the shell interpreting the quotes, not pg_dump itself.
      const escapedPostgresUrl = postgresUrl.replace(/'/g, '\'\\\\\'\'')
      pgDumpBaseCommand = `pg_dump --dbname='${escapedPostgresUrl}' --format=c`
      // PGPASSWORD is not typically set when the password is in the connection string for pg_dump.
      console.log('Using POSTGRES_URL for database connection.')
    }
    else if (dbHost && dbPort && dbUser && dbPassword && dbName) {
      pgDumpBaseCommand = `pg_dump --host=${dbHost} --port=${dbPort} --username=${dbUser} --dbname=${dbName} --format=c --no-password`
      pgDumpExecaOptions.env.PGPASSWORD = dbPassword
      console.log('Using individual POSTGRES_HOST/USER/DB variables for database connection.')
    }
    else {
      console.error('Database connection environment variables are not fully configured. Provide POSTGRES_URL or all of POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB. Skipping backup.')
      return { result: 'Error: Missing database environment variables' }
    }

    // pg_dump command will output to stdout, then piped to gzip
    const fullBackupCommand = `${pgDumpBaseCommand} | gzip > ${localBackupPath}`

    try {
      console.log(`Starting database backup to ${localBackupPath}...`)
      // Execute the piped command using shell
      await execa(fullBackupCommand, pgDumpExecaOptions)
      console.log('Database dump and compression successful.')

      const fileContent = await fs.readFile(localBackupPath)
      const s3Key = `backups/database/${backupFileName}`

      console.log(`Uploading backup to S3 bucket ${s3Bucket} with key ${s3Key}...`)
      const s3Client = getS3Client()

      await s3Client.send(new PutObjectCommand({
        Bucket: s3Bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/gzip', // Specify content type for gzipped file
      }))
      console.log('Backup uploaded to S3 successfully.')

      // Implement 3-day retention policy
      console.log('Applying 3-day retention policy...')
      const listCommand = new ListObjectsV2Command({
        Bucket: s3Bucket,
        Prefix: 'backups/database/',
      })
      const listedObjects = await s3Client.send(listCommand)

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        const cutoffDate = new Date(now)
        cutoffDate.setDate(now.getDate() - BACKUP_RETENTION_DAYS) // Keep today's and 2 previous days' backups

        const objectsToDelete = listedObjects.Contents.filter((obj) => {
          if (!obj.Key)
            return false
          const match = obj.Key.match(/backup-(\\d{4}-\\d{2}-\\d{2})\\.sql\\.gz$/)
          if (match && match[1]) {
            const backupDate = new Date(match[1])
            // Ensure comparison is date-only by setting hours to 0
            backupDate.setHours(0, 0, 0, 0)
            const comparisonCutoff = new Date(cutoffDate)
            comparisonCutoff.setHours(0, 0, 0, 0)
            return backupDate < comparisonCutoff
          }
          return false
        })

        if (objectsToDelete.length > 0) {
          const deleteParams = {
            Bucket: s3Bucket,
            Delete: {
              Objects: objectsToDelete.map(obj => ({ Key: obj.Key })),
              Quiet: false,
            },
          }
          const deleteResult = await s3Client.send(new DeleteObjectsCommand(deleteParams))
          if (deleteResult.Deleted && deleteResult.Deleted.length > 0) {
            console.log(`Successfully deleted ${deleteResult.Deleted.length} old backup(s): ${deleteResult.Deleted.map(d => d.Key).join(', ')}`)
          }
          if (deleteResult.Errors && deleteResult.Errors.length > 0) {
            deleteResult.Errors.forEach(err => console.error(`Error deleting S3 object ${err.Key}: ${err.Message}`))
          }
        }
        else {
          console.log('No old backups found to delete.')
        }
      }
      else {
        console.log('No backups found in S3 to apply retention policy.')
      }

      return { result: 'Success', backupPath: s3Key }
    }
    catch (error: any) {
      console.error('Database backup or S3 upload failed:', error.message)
      if (error.stderr) {
        console.error('pg_dump stderr:', error.stderr)
      }
      if (error.stdout) {
        console.error('pg_dump stdout:', error.stdout)
      }
      return { result: 'Error', error: error.message }
    }
    finally {
      try {
        await fs.unlink(localBackupPath)
        console.log(`Cleaned up local backup file: ${localBackupPath}`)
      }
      catch (cleanupError: any) {
        // Log if cleanup fails but don't let it mask the primary error
        console.warn(`Failed to clean up local backup file ${localBackupPath}:`, cleanupError.message)
      }
    }
  },
})
