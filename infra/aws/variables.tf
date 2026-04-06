variable "aws_account_id" {
  description = "Only apply in this AWS account (safety check)."
  type        = string
  default     = "002228171094"
}

variable "aws_region" {
  description = "Region for all resources (e.g. ap-south-1 Mumbai)."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "chatbot-platform"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "rds_allowed_cidr_blocks" {
  description = "IPv4 CIDRs allowed to connect to Postgres (port 5432). For dev you may use your public IP /32; avoid 0.0.0.0/0 in production."
  type        = list(string)
  default     = []
}

variable "rds_publicly_accessible" {
  description = "If true, RDS gets a public IP (needed for Vercel/serverless outside VPC). Lock down with rds_allowed_cidr_blocks."
  type        = bool
  default     = true
}

variable "db_name" {
  type    = string
  default = "chatbot"
}

variable "db_username" {
  type    = string
  default = "chatbot_admin"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "db_allocated_storage_gb" {
  type    = number
  default = 20
}
