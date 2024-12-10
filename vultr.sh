#!/bin/bash

# Function to generate a random available network port number
generate_random_port() {
    local port
    while true; do
        port=$((RANDOM % 64000 + 1024))  # Generate a random port between 1024 and 65000
        netstat -tln | grep -q ":$port " || break  # Check if the port is available
    done
    echo $port
}

curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
# Generate two random available net port numbers
port1=$(generate_random_port)
port2=$(generate_random_port)

host_ip=$(hostname -I | awk '{print $1}')

docker run -d \
  --name=wg-easy \
  -e LANG=en \
  -e WG_HOST=${host_ip} \
  -e PASSWORD=bumoyu123 \
  -v /wg-easy:/etc/wireguard \
  -p 51820:51820/udp \
  -p 51821:51821/tcp \
  --cap-add=NET_ADMIN \
  --cap-add=SYS_MODULE \
  --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
  --sysctl="net.ipv4.ip_forward=1" \
  --restart unless-stopped \
  gzd1987829/liberty_link:0.1

# Launch two Docker containers
docker run -d --name=morph_vpn_server --network host --restart unless-stopped gzd1987829/morph_vpn_server:0.0.1
docker exec -t morph_vpn_server sed -i "s/12301/${port1}/g" process.json
docker exec -t morph_vpn_server sed -i "s/8088/${port2}/g" process.json
docker exec -dt morph_vpn_server pm2-runtime start process.json

#!/bin/bash

# Fetch the JSON data
response=$(curl -s http://169.254.169.254/v1.json)

# Extract the hostname using jq
hostname=$(echo "$response" | jq -r '.hostname')

# Print the hostname
echo "Hostname: $hostname"
# API URL and data to send (replace with actual values)
# api_url="https://your-api-url.com/update_ports"
# data="{\"container1_port\": \"$port1\", \"container2_port\": \"$port2\"}"

# Use curl to access the API and update the ports to the database
# curl -X POST -H "Content-Type: application/json" -d "$data" $api_url