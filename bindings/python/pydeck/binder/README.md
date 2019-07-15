Binder support
=======

Interactive examples in this repo are supported by [Binder](https://mybinder.org/).

Sync the branch with master

```bash
git checkout master
git pull
git checkout binder
git merge binder
```

While on the `binder` branch and in this directory, the following commands copy the Dockerfile
here to the root of this repository and create a symlink to the examples if not already present

```bash
cp Dockerfile ../../../../Dockerfile
cp .dockerignore ../../../../.dockerignore
ln -s ../examples ../../../../notebook_examples
```

To verify that the binder Dockerfile works locally, you can visit the URL
output by the following commands:

```bash
docker build -t test-binder:latest .
docker run -p 8888:8888 test-binder:latest jupyter notebook --ip 0.0.0.0
```
