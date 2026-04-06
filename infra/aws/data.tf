data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

# Pin a full minor version: "16" alone matches many 16.x releases and the data source errors.
data "aws_rds_engine_version" "postgres16" {
  engine  = "postgres"
  version = "16.13"
}

check "correct_account" {
  assert {
    condition     = data.aws_caller_identity.current.account_id == var.aws_account_id
    error_message = "Refusing to apply: AWS CLI is not using account ${var.aws_account_id}. Run aws sts get-caller-identity and fix credentials."
  }
}
