FROM ipfs/go-ipfs:latest

#
ENV IPFS_SWARM_KEY_FILE /swarm.key

# Custom start script.
COPY ./start_ipfs /usr/local/bin/start_ipfs

# Fix permissions on start_ipfs (ignore the build machine's permissions)
RUN chmod 0755 /usr/local/bin/start_ipfs

# DreamLink swarm key.
COPY ./swarm.key /swarm.key

# Execute the daemon subcommand by default
CMD ["daemon", "--migrate=true", "--enable-gc=true", "--enable-pubsub-experiment=true", "--enable-namesys-pubsub=true"]