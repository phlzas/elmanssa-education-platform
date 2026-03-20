import paramiko

host = '76.13.36.5'
port = 22
username = 'root'
password = 'elmanssa1234.COM'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=username, password=password, timeout=30)
    
    # Check service log
    stdin, stdout, stderr = client.exec_command('tail -50 /tmp/elmanssa.log', timeout=10)
    output = stdout.read().decode()
    errors = stderr.read().decode()
    
    print("=== SERVICE LOG ===")
    print(output if output else "(no output)")
    if errors:
        print("=== ERRORS ===")
        print(errors)
    
    # Check if service is running
    stdin, stdout, stderr = client.exec_command('ps aux | grep -i elmanassa | grep -v grep', timeout=10)
    output = stdout.read().decode()
    print("\n=== SERVICE PROCESS ===")
    print(output if output else "(not running)")
    
    client.close()
except Exception as e:
    print(f"Error: {e}")
