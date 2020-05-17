FROM ubuntu:18.04

# OS Update
RUN apt-get update -y && apt-get install wget curl -y

# Install Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
USER docker

#
ARG DEBIAN_FRONTEND=noninteractive
ENV DEBIAN_FRONTEND noninteractive

# Install aaPanel
RUN wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && bash install.sh

# Ports
EXPOSE 20
EXPOSE 21
EXPOSE 22
EXPOSE 443
EXPOSE 80
EXPOSE 888
EXPOSE 8888

# Volumes
VOLUME /www

ENTRYPOINT ["/tini", "--"]
CMD ["/bin/sh"]
