package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Port                 string   `yaml:"port"`
	TableName            string   `yaml:"table_name"`
	CORSOrigins          []string `yaml:"cors_origins"`
	MediaBaseURL         string   `yaml:"media_base_url"`
	BotCheckProvider     string   `yaml:"bot_check_provider"`
	MockBotCheckPassword string   `yaml:"mock_bot_check_password"`
	PaymentProvider      string   `yaml:"payment_provider"`
}

func Defaults() Config {
	return Config{
		Port:             "3000",
		TableName:        "",
		CORSOrigins:      []string{"http://localhost:5173"},
		BotCheckProvider: "mock",
		PaymentProvider:  "mock",
	}
}

func Load(path string) (Config, error) {
	cfg := Defaults()

	data, err := os.ReadFile(path)
	if err != nil {
		if !os.IsNotExist(err) {
			return Config{}, fmt.Errorf("read config: %w", err)
		}
	} else if err := yaml.Unmarshal(data, &cfg); err != nil {
		return Config{}, fmt.Errorf("parse config: %w", err)
	}

	applyEnv(&cfg)
	return cfg, nil
}

func applyEnv(cfg *Config) {
	if v := os.Getenv("TABLE_NAME"); v != "" {
		cfg.TableName = v
	}

	if v := os.Getenv("PORT"); v != "" {
		cfg.Port = v
	}

	if v := os.Getenv("MEDIA_BASE_URL"); v != "" {
		cfg.MediaBaseURL = v
	}

	if v := os.Getenv("BOT_CHECK_PROVIDER"); v != "" {
		cfg.BotCheckProvider = v
	}

	if v := os.Getenv("MOCK_BOT_CHECK_PASSWORD"); v != "" {
		cfg.MockBotCheckPassword = v
	}

	if v := os.Getenv("PAYMENT_PROVIDER"); v != "" {
		cfg.PaymentProvider = v
	}
}
