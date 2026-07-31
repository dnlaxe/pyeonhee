package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Port        string   `yaml:"port"`
	TableName   string   `yaml:"table_name"`
	CORSOrigins []string `yaml:"cors_origins"`
}

func Defaults() Config {
	return Config{
		Port:        "3000",
		TableName:   "",
		CORSOrigins: []string{"http://localhost:5173"},
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
}
