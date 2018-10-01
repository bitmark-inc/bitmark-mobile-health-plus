package logmodule

import (
	"fmt"

	"github.com/fluent/fluent-logger-golang/fluent"
	log "github.com/sirupsen/logrus"
)

type FluentdHook struct {
	fluentLogger *fluent.Fluent
	tag          string
}

func NewFluentdHook(tag, host string, port int) *FluentdHook {
	logger, err := fluent.New(fluent.Config{
		FluentHost: host,
		FluentPort: port,
	})
	if err != nil {
		fmt.Println(err)
	}
	return &FluentdHook{
		fluentLogger: logger,
		tag:          tag,
	}
}

func (h *FluentdHook) Levels() []log.Level {
	return []log.Level{
		log.WarnLevel,
		log.ErrorLevel,
		log.FatalLevel,
		log.PanicLevel,
		log.InfoLevel,
	}
}

func (h *FluentdHook) Fire(entry *log.Entry) (err error) {
	message := map[string]interface{}{
		"message": entry.Message,
		"level":   levelToText(entry.Level),
	}
	fmt.Printf("send log to fluentd: %+v\n", message)
	return h.fluentLogger.PostWithTime(h.tag, entry.Time, message)
}

func levelToText(level log.Level) string {
	switch level {
	case log.PanicLevel:
		return "panic"
	case log.FatalLevel:
		return "fatal"
	case log.WarnLevel:
		return "warn"
	case log.ErrorLevel:
		return "error"
	case log.InfoLevel:
		return "info"
	}
	return ""
}
