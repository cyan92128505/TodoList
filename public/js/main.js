angular.module('todoApp', [])
    .config([
        '$locationProvider',
        $locationProvider => $locationProvider.html5Mode(true).hashPrefix('')
    ])
    .controller('todoCtrl', [
        '$q',
        '$http',
        '$scope',
        '$timeout',
        '$location',
        (
            $q,
            $http,
            $scope,
            $timeout,
            $location
        ) => {

            // const queryString = parseQuery(window.location.search);
            const queryString = $location.search();

            $scope.queryStatusId = queryString.status ? queryString.status.split(',') : [];
            $scope.statusList = [];
            $scope.list = [];

            $http.get('/api/todo/status').then(arg => {
                const deferred = $q.defer();
                deferred.resolve(arg.data);
                return deferred.promise
            }).then(statusList => {
                $scope.statusList = statusList;
                $scope.statusList.forEach(s => s.isChecked = filterStatus(s.id));
                $scope.setupList();
            });

            $scope.selectStatus = () => {
                $timeout(() => {
                    $location.search({
                        status: $scope.statusList.filter(s => s.isChecked).map(s => s.id).join(',')
                    });
                    $scope.setupList();
                })
            }

            $scope.setupList = () => {
                $timeout(() => {
                    $http.post('/api/todo/list', {
                        status: $scope.statusList.filter(s => s.isChecked).map(s => s.id)
                    }).then(arg =>
                        ($scope.list = arg.data
                            .map(term => {
                                term.status = $scope.statusList.filter(s => s.id === term.status)[0];
                                return term;
                            }))
                    )
                })
            }

            function filterStatus(status) {
                return $scope.queryStatusId.length === 0 ?
                    true :
                    $scope.queryStatusId.some(q => status === +q);
            }

        }
    ]);