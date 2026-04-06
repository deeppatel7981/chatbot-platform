# AWS infrastructure (Terraform)

Creates resources in account **`002228171094`** only (enforced by a Terraform `check`). Default region: **`ap-south-1`** (Mumbai).

## What gets created

- **VPC** + 2 public subnets + IGW (no NAT — keeps cost down; RDS is publicly reachable if `rds_publicly_accessible = true`).
- **RDS PostgreSQL 16** (`db.t4g.micro`, 20 GB gp3) with a random master password.
- **Security group** allowing Postgres **5432** from `rds_allowed_cidr_blocks`, or **`0.0.0.0/0`** if you leave the list empty (dev only — tighten for production).
- **S3 bucket** for document uploads (private, encrypted, versioned).
- **Secrets Manager** secret with the full **`DATABASE_URL`** connection string.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.6
- [AWS CLI](https://aws.amazon.com/cli/) configured for account `002228171094` (`aws sts get-caller-identity`)
- IAM permissions to create VPC, RDS, EC2 security groups, S3, Secrets Manager

## Apply

```bash
cd infra/aws
terraform init

# Optional: restrict who can reach Postgres (recommended)
# export TF_VAR_rds_allowed_cidr_blocks='["YOUR.PUBLIC.IP.ADDRESS/32"]'

terraform plan
terraform apply
```

After apply, run:

```bash
terraform output -raw next_steps
```

Fetch `DATABASE_URL`:

```bash
aws secretsmanager get-secret-value \
  --secret-id "$(terraform output -raw database_url_secret_name)" \
  --query SecretString --output text
```

## App environment

Set on your host (Vercel / ECS / local `.env.local`):

| Variable | Value |
|----------|--------|
| `MOCK_DATA` | `false` |
| `DATABASE_URL` | From Secrets Manager (above) |
| `NEXTAUTH_URL` | Your app URL |
| `NEXTAUTH_SECRET` | Long random string |
| `OPENAI_API_KEY` | Your OpenAI key |
| `AWS_REGION` | `ap-south-1` |
| `AWS_S3_BUCKET` | `terraform output -raw s3_bucket_name` |

IAM: prefer an **IAM role** on ECS/EC2 for S3 access instead of static keys. For Vercel, use **IAM user** keys with minimal S3 policy or proxy uploads through your API only.

## One-time database setup

Connect with `psql` using the same URL, then:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Then from the repo root:

```bash
npm run db:push
npm run db:seed
```

## Cost & safety

- `db.t4g.micro` + 20 GB is small; RDS still has a monthly cost.
- **Do not** commit `terraform.tfstate` (it contains secrets). It is gitignored here; use S3 backend + locking for teams.

## Destroy

```bash
terraform destroy
```

This deletes RDS data unless you change `skip_final_snapshot`.
