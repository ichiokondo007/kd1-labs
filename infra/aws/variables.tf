variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "kd1-labs"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "domain_name" {
  description = "Domain name for the application (e.g. kd1.example.com)"
  type        = string
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone name (e.g. example.com)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.xlarge"
}

variable "volume_size" {
  description = "EBS volume size in GB"
  type        = number
  default     = 30
}

variable "ssh_key_name" {
  description = "Name of an existing EC2 key pair for SSH access"
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed for SSH access"
  type        = string
  default     = "0.0.0.0/0"
}
