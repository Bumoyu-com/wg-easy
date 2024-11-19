docker run -d \
  --name=wg-easy \
  -e LANG=en \
  -e WG_HOST=8.210.14.231 \
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

docker run -d \
  --name=tunnel-app \
  --network host\
  --restart unless-stopped \
  gzd1987829/tunnel_app:0.1


redroid:
apt install linux-modules-extra-`uname -r`
modprobe binder_linux devices="binder,hwbinder,vndbinder"
modprobe ashmem_linux

docker run -itd --rm --privileged --pull always -v ~/data:/data -p 5555:5555 redroid/redroid:11.0.0-latest

docker run -itd --rm --privileged \
    --pull always \
    -v ~/data:/data \
    -p 5555:5555 \
    redroid/redroid:9.0.0-latest

香港现在用的莱卡云

香港digitalvirt 不用实名 19元 1000G流量

