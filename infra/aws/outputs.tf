output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  value = aws_db_instance.postgres.address
}

output "s3_bucket_name" {
  value = aws_s3_bucket.uploads.bucket
}

output "database_url_secret_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}

output "database_url_secret_name" {
  value = aws_secretsmanager_secret.database_url.name
}

output "next_steps" {
  value = <<-EOT
    1) Fetch DATABASE_URL: aws secretsmanager get-secret-value --secret-id ${aws_secretsmanager_secret.database_url.name} --query SecretString --output text
    2) Set MOCK_DATA=false and DATABASE_URL in your app environment (Vercel / ECS).
    3) Enable pgvector on the DB (one-time): connect with psql and run: CREATE EXTENSION IF NOT EXISTS vector;
    4) Run from repo: npm run db:push && npm run db:seed
    5) Set AWS_S3_BUCKET=${aws_s3_bucket.uploads.bucket} AWS_REGION=${var.aws_region} for document uploads.
  EOT
}
