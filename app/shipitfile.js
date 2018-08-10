module.exports = function (shipit) {
    require('shipit-deploy')(shipit);

    shipit.initConfig({
        default: {
            workspace: '/tmp/app1',
            deployTo: '/home/deploy/app1',
            repositoryUrl: 'https://github.com/mihafin/test_exp.git',
            ignores: ['.git'],
            keepReleases: 2,
            deleteOnRollback: false,
            //key: '/path/to/key',
            shallowClone: true
        },
        staging: {
            servers: '193.19.119.137'
        }
    });

    shipit.task('pwd', function () {
        return shipit.remote('pwd');
    });
};