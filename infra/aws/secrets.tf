locals {
  database_url = format(
    "postgresql://%s:%s@%s:%s/%s",
    var.db_username,
    urlencode(random_password.db_master.result),
    aws_db_instance.postgres.address,
    aws_db_instance.postgres.port,
    var.db_name
  )
}

resource "aws_secretsmanager_secret" "database_url" {
  name        = "${var.project_name}/database-url-${var.environment}"
  description = "Postgres connection string for chatbot-platform app"
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = local.database_url
}
