import { promises as fs, mkdirSync } from 'node:fs'
import path, { join } from 'node:path'
import type { H3Event } from 'h3'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

export type LogLevel = 'log' | 'info' | 'warn' | 'error'

const customToWinstonLevel: Record<LogLevel, string> = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  log: 'verbose',
}

function winstonToCustomLevel(winstonLevel: string): LogLevel | undefined {
  if (winstonLevel === 'verbose') {
    return 'log'
  }
  if (['error', 'warn', 'info'].includes(winstonLevel)) {
    return winstonLevel as LogLevel
  }
  return undefined
}

const isDev = process.env.NODE_ENV === 'development'

export class Logger {
  private logger: winston.Logger
  private s3Bucket: string | null = null
  private s3Client?: S3Client
  private enabledLogLevels: Set<LogLevel> | null = null
  private logsDir: string
  private dailyRotateFileTransport: DailyRotateFile

  constructor(logsDirOpt?: string) {
    this.logsDir = logsDirOpt || join(process.cwd(), 'logs')
    this.ensureLogDirectoryExistsSync()
    this.initS3Config()
    this.initLogLevels()

    const winstonLogLevel = this.determineWinstonLogLevel()

    const levelFilter = winston.format((info) => {
      if (this.enabledLogLevels === null) {
        return info
      }
      const customLevel = winstonToCustomLevel(info.level)
      return customLevel && this.enabledLogLevels.has(customLevel) ? info : false
    })

    this.dailyRotateFileTransport = new DailyRotateFile({
      level: winstonLogLevel,
      dirname: this.logsDir,
      filename: '%DATE%.log',
      zippedArchive: false,
      frequency: isDev ? '1m' : '15m',
      maxFiles: '2d',
      datePattern: 'YYYY-MM-DD-HH-mm',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        levelFilter(),
        winston.format.json(),
      ),
    })

    this.dailyRotateFileTransport.on('archive', (archivedPath: string) => {
      if (this.s3Bucket && this.s3Client) {
        this.uploadToS3(archivedPath).catch(err => console.error('S3 upload failed from archive event:', err))
      }
    })

    this.dailyRotateFileTransport.on('error', (error: Error) => {
      console.error('Winston DailyRotateFile Transport Error:', error)
    })

    this.logger = winston.createLogger({
      level: winstonLogLevel,
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            levelFilter(),
          ),
          silent: this.enabledLogLevels !== null && this.enabledLogLevels.size === 0,
        }),
        this.dailyRotateFileTransport,
      ],
    })

    if (this.enabledLogLevels !== null && this.enabledLogLevels.size === 0) {
      console.info('Logger: All logging is disabled (LOG_LEVEL is empty array or all levels filtered out)')
    }
  }

  private initLogLevels() {
    const logLevelEnv = process.env.LOG_LEVEL

    if (logLevelEnv === undefined) {
      this.enabledLogLevels = null
      console.info('Logger: LOG_LEVEL is undefined, all log levels enabled.')
    }
    else {
      try {
        const parsedLevels = JSON.parse(logLevelEnv)
        if (Array.isArray(parsedLevels)) {
          if (parsedLevels.length === 0) {
            this.enabledLogLevels = new Set()
            console.info('Logger: LOG_LEVEL is an empty array, file logging disabled.')
          }
          else {
            const validLevels = parsedLevels.filter(
              (level): level is LogLevel => Object.keys(customToWinstonLevel).includes(level),
            )
            this.enabledLogLevels = new Set(validLevels)
            console.info(`Logger: Enabled log levels: ${Array.from(this.enabledLogLevels).join(', ')}`)
          }
        }
        else {
          this.enabledLogLevels = null
          console.warn('Logger: Invalid LOG_LEVEL format, all log levels enabled.')
        }
      }
      catch (error) {
        this.enabledLogLevels = null
        console.warn(`Logger: Failed to parse LOG_LEVEL, all log levels enabled: ${error}`)
      }
    }
  }

  private determineWinstonLogLevel(): string {
    if (this.enabledLogLevels === null) {
      return 'silly'
    }
    if (this.enabledLogLevels.size === 0) {
      return 'error'
    }

    const winstonLevelsHierarchy: { [key: string]: number } = { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
    let maxNumericLevel = -1

    this.enabledLogLevels.forEach((level) => {
      const winstonLevel = customToWinstonLevel[level]
      if (winstonLevel && winstonLevelsHierarchy[winstonLevel] !== undefined) {
        maxNumericLevel = Math.max(maxNumericLevel, winstonLevelsHierarchy[winstonLevel])
      }
    })

    if (maxNumericLevel === -1) {
      return 'error'
    }

    for (const levelStr in winstonLevelsHierarchy) {
      if (winstonLevelsHierarchy[levelStr] === maxNumericLevel) {
        return levelStr
      }
    }
    return 'silly'
  }

  private initS3Config() {
    const bucket = process.env.AWS_LOGGER_S3_BUCKET
    const region = process.env.AWS_LOGGER_S3_REGION || process.env.AWS_S3_REGION
    const accessKeyId = process.env.AWS_S3_ACCESS_KEY
    const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY

    if (bucket && region && accessKeyId && secretAccessKey) {
      this.s3Bucket = bucket
      this.s3Client = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
      })
      console.info(`Logger: S3 uploads enabled to bucket ${bucket} in region ${region}.`)
    }
    else {
      console.warn('Logger: S3 upload disabled due to missing AWS configuration (bucket, region, or credentials).')
    }
  }

  private ensureLogDirectoryExistsSync() {
    try {
      mkdirSync(this.logsDir, { recursive: true })
    }
    catch (error) {
      console.error(`Logger: Error creating logs directory '${this.logsDir}':`, error)
    }
  }

  private async uploadToS3(filePath: string) {
    if (!this.s3Bucket || !this.s3Client) {
      console.warn(`Logger: S3 upload skipped for ${filePath}, S3 not configured.`)
      return
    }

    try {
      const fileStats = await fs.stat(filePath)
      if (fileStats.size === 0) {
        console.info(`Logger: Skipping empty archived log file: ${filePath}`)
        await fs.unlink(filePath)
        return
      }

      const fileContent = await fs.readFile(filePath)
      const fileName = path.basename(filePath)

      const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/)
      let s3KeyPrefix = 'logs/unknown-date/'
      if (dateMatch && dateMatch[1]) {
        const [year, month, day] = dateMatch[1].split('-')
        s3KeyPrefix = `logs/${year}/${month}/${day}/`
      }

      const s3Key = `${s3KeyPrefix}${fileName}`

      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'text/plain', // Changed from application/gzip
      }))

      console.info(`Logger: Successfully uploaded log file to S3: ${s3Key}`)
      await fs.unlink(filePath)
      console.info(`Logger: Deleted local archived log file: ${filePath}`)
    }
    catch (error) {
      console.error(`Logger: Error uploading log file ${filePath} to S3:`, error)
    }
  }

  public log(message: any, meta?: Record<string, any>) {
    this.logger.verbose(message, meta)
  }

  public info(message: any, meta?: Record<string, any>) {
    this.logger.info(message, meta)
  }

  public warn(message: any, meta?: Record<string, any>) {
    this.logger.warn(message, meta)
  }

  public error(message: any, meta?: Record<string, any>) {
    this.logger.error(message, meta)
  }

  public createRequestLogger() {
    return async (event: H3Event, meta?: Record<string, any>) => {
      const isInfoEnabled = this.enabledLogLevels === null || this.enabledLogLevels.has('info')
      if (!isInfoEnabled || (this.enabledLogLevels !== null && this.enabledLogLevels.size === 0)) {
        return
      }

      const headers = event.headers
      const headerEntries = Array.from(headers.entries())
      const filteredHeaders = headerEntries.filter(
        ([key]) => !key.toLowerCase().includes('authorization') && !key.toLowerCase().includes('cookie'),
      )

      let body = null
      try {
        if (['POST', 'PUT', 'PATCH'].includes(event.method)) {
          body = await readBody(event).catch(() => null)
        }
      }
      catch (error) {
        this.warn('Logger: Failed to read request body for logging:', { error })
      }

      const requestMeta = {
        method: event.method,
        url: event.path,
        params: event.context.params,
        query: getQuery(event),
        headers: Object.fromEntries(filteredHeaders as Array<[string, string]>),
        ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
        body,
        ...meta,
      }

      this.info(`Request: ${event.method} ${event.path}`, requestMeta)
    }
  }
}

const logger = new Logger()

export { logger }
