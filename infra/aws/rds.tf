resource "random_password" "db_master" {
  length  = 32
  special = false
}

resource "aws_db_instance" "postgres" {
  identifier = "${var.project_name}-pg-${var.environment}"

  engine         = "postgres"
  engine_version = data.aws_rds_engine_version.postgres16.version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage_gb
  max_allocated_storage = 100
  storage_type          = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_master.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  publicly_accessible          = var.rds_publicly_accessible
  multi_az                     = false
  backup_retention_period      = 7
  deletion_protection          = false
  skip_final_snapshot          = true
  apply_immediately            = true
  auto_minor_version_upgrade   = true
  performance_insights_enabled = false

  tags = {
    Name = "${var.project_name}-postgres"
  }

  lifecycle {
    prevent_destroy = false
  }
}
