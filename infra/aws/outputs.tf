output "app_url" {
  description = "Application URL"
  value       = "https://${var.domain_name}"
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "ec2_public_ip" {
  description = "EC2 public IP (for SSH)"
  value       = aws_instance.app.public_ip
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh -i <key.pem> ec2-user@${aws_instance.app.public_ip}"
}
