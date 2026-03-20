import paramiko
import sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print("Connecting to 76.13.36.5...")
try:
    client.connect(
        hostname='76.13.36.5',
        username='root',
        password='elmanssa1234.COM',
        timeout=30,
        banner_timeout=30
    )
    print("Connected!\n")
    
    commands = [
        ('Command 1: List tables', 'sudo -u postgres psql -d elmanssa_datebase -c "\\dt"'),
        ('Command 2: Get table names', 'sudo -u postgres psql -d elmanssa_datebase -c "SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;"'),
        ('Command 3: Tail log', 'tail -20 /tmp/elmanssa.log')
    ]
    
    for name, cmd in commands:
        print(f"\n{'='*60}")
        print(f"{name}")
        print(f"{'='*60}")
        print(f"$ {cmd}\n")
        
        stdin, stdout, stderr = client.exec_command(cmd)
        exit_code = stdout.channel.recv_exit_status()
        
        output = stdout.read().decode('utf-8', errors='replace')
        error = stderr.read().decode('utf-8', errors='replace')
        
        if output:
            print(output)
        if error:
            print(f"STDERR: {error}")
        print(f"Exit code: {exit_code}")
    
    client.close()
    print("\nDone!")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
