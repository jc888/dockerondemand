# DockerOnDemand

Proof of concept! don't use!

API server, to pull and build a git repo into a named docker container, and invoke it from a API request, streaming the output back

# Setup

Install vagrant / virtualbox

clone and start vagrant

```

git clone git@github.com:jc888/dockerondemand.git
cd dockerondemand
vagrant up
vagrant ssh
startup

```

build a container 

```

http://localhost:8080/build/myhelloworldfunction?url=https://github.com/docker-library/hello-world

```

Invoke a container

```

http://localhost:8080/run/myhelloworldfunction

```


