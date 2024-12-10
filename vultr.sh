#!/bin/bash
set -e && # Exit immediately if a command exits with a non-zero status

# Function to generate a random available network port number
generate_random_port() {
    local port
    while true; do
        port=$((RANDOM % 64000 + 1024))  # Generate a random port between 1024 and 65000
        netstat -tln | grep -q ":$port " || break  # Check if the port is available
    done
    echo $port
}

curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh &&
# Generate two random available net port numbers
port1=$(generate_random_port) &&
port2=$(generate_random_port) &&

host_ip=$(hostname -I | awk '{print $1}') &&

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
  gzd1987829/liberty_link:0.1 &&

# Fetch the JSON data
response=$(curl -s http://169.254.169.254/v1.json) &&

# Extract the hostname using jq
hostname=$(echo "$response" | jq -r '.hostname') &&
cityName=$(echo "$response" | jq -r '.region' | jq -r '.regioncode' | tr '[:upper:]' '[:lower:]') &&
ip=$(echo "$response" | jq -r '.interfaces[0].ipv4.address') &&

# Print the hostname
echo "Hostname: $hostname" > hostname.txt &&

# Launch two Docker containers
docker run -d --name=morph_vpn_server --network host --restart unless-stopped gzd1987829/morph_vpn_server:0.0.1 &&
docker exec -t morph_vpn_server sed -i "s/12301/${port1}/g" process.json &&
docker exec -t morph_vpn_server sed -i "s/8088/${port2}/g" process.json &&
docker exec -t morph_vpn_server sed -i "s/demo_host/${hostname}/g" process.json &&
docker exec -dt morph_vpn_server pm2-runtime start process.json &&

# API URL and data to send (replace with actual values)
api_url2="https://bumoyu-saas-morphvpn-api.zhendong-ge.workers.dev/db/morphVpn_server/updateByName" &&
data2="{\"name\": \"$hostname\", \"udpPort\": \"$port1\", \"tcpPort\": \"$port2\", \"ip\": \"$ip\", \"status\": \"running\"}" &&

# Use curl to access the API and update the ports to the database
curl -X POST -H "Content-Type: application/json" -d "$data2" $api_url2 &&
ufw disable &&

# API URL and data to send (replace with actual values)
api_url="https://bumoyu-saas-morphvpn-api.zhendong-ge.workers.dev/db/morphVpn_city/updateByCityName" &&
data="{\"cityName\": \"$cityName\", \"creating\": 0}" &&

# Use curl to access the API and update the ports to the database
curl -X POST -H "Content-Type: application/json" -d "$data" $api_url &&
