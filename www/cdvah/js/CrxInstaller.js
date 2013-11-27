(function(){
    'use strict';
    /* global myApp */
    myApp.run(['$q', 'Installer', 'AppsService', 'ResourcesLoader', function($q, Installer, AppsService, ResourcesLoader){

        var platformId = cordova.require('cordova/platform').id;

        function CrxInstaller(url, appId) {
            Installer.call(this, url, appId);
        }

        CrxInstaller.prototype = Object.create(Installer.prototype);

        CrxInstaller.prototype.type = 'crx';

        CrxInstaller.prototype._doUpdateApp = function(installPath) {
            var platformConfig = location.pathname.replace(/\/[^\/]*$/, '/crx_files/config.' + platformId + '.xml');
            var targetConfig = installPath + '/config.xml';
            var xhr;
            var self = this;

            var baseName = self.url.match(/\/([^\/]*)$/)[1];
            var crxFile = installPath.replace(/\/$/, '') + '/' + baseName;

            return ResourcesLoader.downloadFromUrl(this.url, crxFile).then(function(destination) {
                return ResourcesLoader.extractZipFile(crxFile, installPath);
            }).then(function() {
                // Copy in the config.<platform>.xml file from the harness.
                return ResourcesLoader.xhrGet(platformConfig);
            }).then(function(_xhr){
                xhr = _xhr;
                return ResourcesLoader.ensureDirectoryExists(targetConfig);
            }).then(function() {
                return ResourcesLoader.writeFileContents(targetConfig, xhr.responseText);
            });
        };

        AppsService.registerInstallerFactory({
            type: 'crx',
            createFromUrl: function(url) {
                // Clean up the URL.
                if (!/^https?:/.test(url)) {
                    url = 'http://' + url;
                }

                // TODO: Fix the missing appId, somehow.
                return $q.when(new CrxInstaller(url, 'New Chrome App'));
            },

            createFromJson: function(url, appId) {
                return new CrxInstaller(url, appId);
            }
        });
    }]);
})();