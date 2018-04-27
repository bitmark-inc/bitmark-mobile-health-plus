package logmodule

import (
	"github.com/jackc/pgx"
	log "github.com/sirupsen/logrus"
)

type PgxLogger struct {
	pgx.Logger
}

func NewPgxLogger() *PgxLogger {
	return &PgxLogger{}
}

func (l *PgxLogger) Log(level pgx.LogLevel, msg string, data map[string]interface{}) {
	logEntry := log.WithFields(data)
	switch level {
	case pgx.LogLevelTrace:
		// logEntry.Debug(msg)
	case pgx.LogLevelDebug:
		// logEntry.Debug(msg)
	case pgx.LogLevelInfo:
		// logEntry.Info(msg)
	case pgx.LogLevelWarn:
		logEntry.Warn(msg)
	case pgx.LogLevelError:
		logEntry.Error(msg)
	case pgx.LogLevelNone:
	default:
	}
}
