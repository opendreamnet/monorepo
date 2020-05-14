@echo off

set containerName=dreamlink-cluster
set containerExec=ipfs-cluster-ctl

docker exec -ti %containerName% sh -c "%containerExec% %*"