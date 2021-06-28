[![Phalanx](https://risk3sixty.com/wp-content/uploads/2019/11/phalanx-logo.png)](https://risk3sixty.com)

## Phalanx Automation Extensions

Compliance for most organizations is a burden from a people and resource perspective, but we've tried to alleviate this pain by supporting automation with third party vendors via APIs and automated evidence gathering.

**Extensions** are any utility or piece of code that can be wrapped in a docker container and executed, where relevant output from said container is sent to standard output (stdout). If you want to build your own container(s) and add them to this standard library, feel free to follow the [development](#Development) steps below.

## Development

### Create your own extension

If you'd like to create your own extension it's a good idea to review the [examples](https://github.com/risk3sixty/phalanx-extensions/tree/master/examples) folder as a starting point for what very simple extensions might look like based on the language you choose to build with.

The only requirement is you need to have a valid `Dockerfile` in the root of the directory that defines everything needed to build a container and execute that outputs relevant information to stdout.

### Create repo tarball

To create a tarball and send to the extension engine, reference the [test image build script](https://github.com/risk3sixty/phalanx-extensions/blob/master/testBuildImage.sh).

It's important that `-C` is used in order to enforce the context of the tarball to the root of the extension directory. The root of the directory should contain the `Dockerfile` that defines the container to execute for the extension.

```sh
$ tar -czf repo.tgz -C $REPO_DIR .
```
