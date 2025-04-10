import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import type { H3Event } from 'h3'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export type LogLevel = 'log' | 'info' | 'warn' | 'error'

export class Logger {
  private logsDir: string
  private s3Bucket: string | null = null
  private currentLogFile: string | null = null
  private uploadQueue: Set<string> = new Set()
  private isUploading = false
  private enabledLogLevels: Set<LogLevel> | null = null
  private maxLogSizeBytes = 15 * 1024 * 1024 // 15MB threshold for "fullness"
  private currentLogSize = 0

  constructor(logsDir: string = join(process.cwd(), 'logs')) {
    this.logsDir = logsDir
    this.ensureLogDirectoryExists()
    this.initS3Config()
    this.initLogLevels()
  }

  private initLogLevels() {
    const logLevelEnv = process.env.LOG_LEVEL

    if (logLevelEnv === undefined) {
      // If undefined, log everything (all levels enabled)
      this.enabledLogLevels = null
      console.info('Logger: LOG_LEVEL is undefined, logging all levels to file')
    }
    else {
      try {
        // Parse the JSON array from environment variable
        const logLevels = JSON.parse(logLevelEnv)

        if (Array.isArray(logLevels) && logLevels.length > 0) {
          // Filter only valid log levels
          const validLevels = logLevels.filter(
            (level): level is LogLevel => ['log', 'info', 'warn', 'error'].includes(level),
          )
          this.enabledLogLevels = new Set(validLevels)
          console.info(`Logger: File logging enabled for levels: ${Array.from(this.enabledLogLevels).join(', ')}`)
        }
        else if (Array.isArray(logLevels) && logLevels.length === 0) {
          // Empty array means log nothing to file
          this.enabledLogLevels = new Set()
          console.info('Logger: File logging disabled (LOG_LEVEL is empty array)')
        }
        else {
          // Invalid format, default to log everything
          this.enabledLogLevels = null
          console.warn('Logger: Invalid LOG_LEVEL format, logging all levels to file')
        }
      }
      catch (error) {
        // If parsing fails, default to log everything
        this.enabledLogLevels = null
        console.warn(`Logger: Failed to parse LOG_LEVEL, logging all levels to file: ${error}`)
      }
    }
  }

  private initS3Config() {
    const bucket = process.env.AWS_LOGGER_S3_BUCKET
    const region = process.env.AWS_LOGGER_S3_REGION || process.env.AWS_S3_REGION

    if (bucket) {
      this.s3Bucket = bucket
      console.info(`Logger configured to use S3 bucket: ${bucket}${region ? ` in region ${region}` : ''}`)
    }
    else {
      console.warn('AWS_LOGGER_S3_BUCKET environment variable not set. S3 upload disabled.')
    }
  }

  private async ensureLogDirectoryExists() {
    try {
      await fs.mkdir(this.logsDir, { recursive: true })
    }
    catch (error) {
      console.error(`Error creating logs directory: ${error}`)
    }
  }

  private shouldLogToFile(level: LogLevel): boolean {
    // If enabledLogLevels is null, log everything
    if (this.enabledLogLevels === null) {
      return true
    }

    // Otherwise, check if this level is in the enabled set
    return this.enabledLogLevels.has(level)
  }

  private getLogFilePath(): string {
    const timestamp = new Date()
    const year = timestamp.getFullYear()
    const month = String(timestamp.getMonth() + 1).padStart(2, '0')
    const day = String(timestamp.getDate()).padStart(2, '0')
    const hour = String(timestamp.getHours()).padStart(2, '0')

    // Format: YYYY-MM-DD-HH.log
    const logFileName = `${year}-${month}-${day}-${hour}.log`
    const logFilePath = join(this.logsDir, logFileName)

    // If the log file has changed, queue the old one for upload
    if (this.currentLogFile && this.currentLogFile !== logFilePath) {
      this.queueForUpload(this.currentLogFile)
      this.currentLogSize = 0
    }

    this.currentLogFile = logFilePath
    return logFilePath
  }

  private queueForUpload(filePath: string) {
    // If file logging is disabled or S3 is not configured, don't queue for upload
    if ((this.enabledLogLevels !== null && this.enabledLogLevels.size === 0) || !this.s3Bucket) {
      return
    }

    this.uploadQueue.add(filePath)
    this.processUploadQueue().catch((err) => {
      console.error('Error processing upload queue:', err)
    })
  }

  private async processUploadQueue() {
    if (this.isUploading || this.uploadQueue.size === 0) {
      return
    }

    this.isUploading = true

    try {
      const filesToUpload = [...this.uploadQueue]
      this.uploadQueue.clear()

      for (const filePath of filesToUpload) {
        try {
          await this.uploadToS3(filePath)
        }
        catch (error) {
          console.error(`Failed to upload ${filePath} to S3:`, error)
          // Add back to queue for retry
          this.uploadQueue.add(filePath)
        }
      }
    }
    finally {
      this.isUploading = false

      // If there are more files (added while we were processing), continue
      if (this.uploadQueue.size > 0) {
        setImmediate(() => this.processUploadQueue())
      }
    }
  }

  private async uploadToS3(filePath: string) {
    if (!this.s3Bucket) {
      return
    }

    try {
      // Use the auto-imported getS3Client when no specific region is provided
      const s3Client = new S3Client({
        region: process.env.AWS_LOGGER_S3_REGION!,
        credentials: {
          accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
        },
      })

      // Check if file exists
      const fileStats = await fs.stat(filePath)
      if (fileStats.size === 0) {
        console.info(`Skipping empty log file: ${filePath}`)
        await fs.unlink(filePath)
        return
      }

      // Read the file content
      const fileContent = await fs.readFile(filePath)

      // Extract file name from the path to use as the S3 key
      const fileName = filePath.split(/[/\\]/).pop()
      if (!fileName) {
        throw new Error(`Could not extract filename from path: ${filePath}`)
      }

      // Create S3 key with logs/ prefix
      const s3Key = `logs/${fileName}`

      // Upload to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'text/plain',
      }))

      console.info(`Successfully uploaded log file to S3: ${s3Key}`)

      // Delete the local file after successful upload
      await fs.unlink(filePath)
      console.info(`Deleted local log file: ${filePath}`)
    }
    catch (error) {
      console.error(`Error uploading log file ${filePath} to S3:`, error)
      throw error
    }
  }

  private async writeToLogFile(level: LogLevel, message: any, meta?: Record<string, any>) {
    // Skip file logging if this level is not enabled
    if (!this.shouldLogToFile(level)) {
      return
    }

    const timestamp = new Date().toISOString()
    const logFilePath = this.getLogFilePath()

    let logEntry: Record<string, any> = {
      timestamp,
      level,
      message: message instanceof Error
        ? message.stack || message.message
        : typeof message === 'object'
          ? JSON.stringify(message)
          : String(message),
    }

    if (meta) {
      logEntry = { ...logEntry, ...meta }
    }

    const logLine = `${JSON.stringify(logEntry)}\n`
    // eslint-disable-next-line node/prefer-global/buffer
    const logLineSize = Buffer.byteLength(logLine, 'utf-8')

    try {
      // Ensure the directory exists
      await fs.mkdir(dirname(logFilePath), { recursive: true })

      // Append log to file
      await fs.appendFile(
        logFilePath,
        logLine,
        'utf-8',
      )

      // Track current log file size
      this.currentLogSize += logLineSize

      // Check if the log file size exceeds threshold
      if (this.currentLogSize >= this.maxLogSizeBytes) {
        // Change the current log file to force rotation
        this.currentLogFile = null
        this.currentLogSize = 0

        // Queue the full log file for upload
        if (logFilePath !== null) {
          this.queueForUpload(logFilePath)
        }
      }
    }
    catch (error) {
      console.error(`Error writing to log file: ${error}`)
    }
  }

  public async log(message: any, meta?: Record<string, any>) {
    console.log(message, meta)
    await this.writeToLogFile('log', message, meta)
  }

  public async info(message: any, meta?: Record<string, any>) {
    console.info(message, meta)
    await this.writeToLogFile('info', message, meta)
  }

  public async warn(message: any, meta?: Record<string, any>) {
    console.warn(message, meta)
    await this.writeToLogFile('warn', message, meta)
  }

  public async error(message: any, meta?: Record<string, any>) {
    console.error(message, meta)
    await this.writeToLogFile('error', message, meta)
  }

  public createRequestLogger() {
    return async (event: H3Event, meta?: Record<string, any>) => {
      // Skip request logging if 'info' level is not enabled
      if (!this.shouldLogToFile('info')) {
        return
      }

      const headers = event.headers
      const headerEntries = Array.from(headers.entries())

      const filteredHeaders = headerEntries.filter(
        (entry: [string, string]) => {
          const key = entry[0]
          return !key.toLowerCase().includes('authorization')
            && !key.toLowerCase().includes('cookie')
        },
      )

      // Try to get the request body if present
      let body = null
      try {
        // Only try to read the body for methods that typically have one
        if (['POST', 'PUT', 'PATCH'].includes(event.method)) {
          body = await readBody(event).catch(() => null)
        }
      }
      catch (error) {
        console.warn('Failed to read request body:', error)
      }

      const requestMeta = {
        method: event.method,
        url: event.path,
        params: event.context.params,
        query: event.context.query,
        headers: Object.fromEntries(filteredHeaders as Array<[string, string]>),
        ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
        body,
        ...meta,
      }

      await this.info(`Request: ${event.method} ${event.path}`, requestMeta)
    }
  }

  // Method to manually trigger an upload of all log files
  public async flushLogs() {
    // If file logging is completely disabled, don't attempt to flush
    if (this.enabledLogLevels !== null && this.enabledLogLevels.size === 0) {
      console.info('Logger: File logging is disabled, skipping flush')
      return
    }

    try {
      // Read all files in the logs directory
      const files = await fs.readdir(this.logsDir)

      // Filter for log files (ending with .log)
      const logFiles = files.filter(file => file.endsWith('.log'))
        .map(file => join(this.logsDir, file))

      // Skip the current log file
      const filesToUpload = logFiles.filter(file => file !== this.currentLogFile)

      // Queue all log files for upload
      for (const file of filesToUpload) {
        this.queueForUpload(file)
      }
    }
    catch (error) {
      console.error('Error flushing logs:', error)
    }
  }

  // Configure log file size threshold (in MB)
  public setMaxLogSize(sizeInMB: number) {
    if (sizeInMB > 0) {
      this.maxLogSizeBytes = sizeInMB * 1024 * 1024
      console.info(`Logger: Set max log file size to ${sizeInMB}MB`)
    }
  }
}

// Create and export a default logger instance
const logger = new Logger()

export { logger }
