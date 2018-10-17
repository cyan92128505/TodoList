var statusListSource = [{
        "id": 1,
        "name": "未完成"
    },
    {
        "id": 2,
        "name": "進行中"
    },
    {
        "id": 3,
        "name": "已完成"
    }
];

var todoListSource = [{
        "id": 1,
        "status": 1,
        "name": "事項一",
        "description": "處理事項一"
    },
    {
        "id": 2,
        "status": 2,
        "name": "事項二",
        "description": "處理事項二"
    },
    {
        "id": 3,
        "status": 2,
        "name": "事項三",
        "description": "處理事項三"
    },
    {
        "id": 4,
        "status": 3,
        "name": "事項四",
        "description": "處理事項四"
    },
    {
        "id": 5,
        "status": 1,
        "name": "事項五",
        "description": "處理事項五"
    },
    {
        "id": 6,
        "status": 1,
        "name": "事項六",
        "description": "處理事項六"
    }
];

var todoApp = angular.module('todoApp', ['ngMockE2E'])
    .config([
        '$locationProvider',
        $locationProvider => $locationProvider.html5Mode(true).hashPrefix('')
    ])
    .run(['$httpBackend', function ($httpBackend) {
        $httpBackend.whenGET('/api/todo/status').respond(statusListSource);

        $httpBackend.whenPOST('/api/todo/list').respond((method, url, data) => {
            const option = angular.fromJson(data);
            todoListSource.forEach(t => t.isNew = false);

            return [200, todoListSource
                .filter(t => option.length > 0 ?
                    option.some(s => +s == t.status) :
                    true), {}
            ];
        });

        $httpBackend.whenPOST('/api/todo/delete').respond((method, url, data) => {
            const option = angular.fromJson(data);
            todoListSource = todoListSource.filter(t => t.id != option.Id);
            return [200, {
                IsSuccess: true,
                ReturnObject: null
            }, {}];
        });

        $httpBackend.whenPOST('/api/todo/create').respond((method, url, data) => {
            const option = angular.fromJson(data);
            const lastest = [].concat(todoListSource).sort((a, b) => (b.id - a.id))[0];
            const newTerm = {
                id: lastest ? lastest.id + 1 : 1,
                status: 1,
                name: option.Name,
                description: option.Description,
                isNew: true
            }
            todoListSource.unshift(newTerm);
            return [200, {
                IsSuccess: true,
                ReturnObject: todoListSource
            }, {}];
        });

        $httpBackend.whenPOST('/api/todo/update').respond((method, url, data) => {
            const option = angular.fromJson(data);
            const target = todoListSource.filter(t => t.id === option.Id)[0];
            target.name = option.Name;
            target.description = option.Description;

            return [200, {
                IsSuccess: true,
                ReturnObject: null
            }, {}];
        });

        $httpBackend.whenPOST('/api/todo/update/status').respond((method, url, data) => {
            const option = angular.fromJson(data);
            const target = todoListSource.filter(t => t.id === option.Id)[0];
            target.status == 3 ? target.status = 1 : target.status++;
            return [200, {
                IsSuccess: true,
                ReturnObject: null
            }, {}];
        });
    }])
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
            const queryString = $location.search();
            let todoList = [];
            let statusList = [];

            $scope.setupList = (isNew) => {
                $http.post('/api/todo/list', $scope.queryStatusId).then(arg => {
                    $scope.list = [].concat(arg.data).map(term => {
                        term.statusInfo = $scope.statusList.filter(s => s.id ===
                            term.status)[0];
                        return term;
                    });
                })
            }

            $scope.selectStatus = () => {
                $scope.queryStatusId = $scope.statusList
                    .filter(s => s.isChecked)
                    .map(s => s.id)
                $location.search({
                    status: $scope.queryStatusId.join(',')
                });
                $scope.setupList();
            }

            $scope.deleteTerm = (termId) => {
                $http.post('/api/todo/delete', {
                    Id: termId
                }).then(arg => $scope.setupList());;
            };

            $scope.createTerm = (term) => {
                if (!term.name && !term.description) {
                    return;
                }
                $http.post('/api/todo/create', {
                    Name: term.name,
                    Description: term.description
                }).then(arg => {
                    term.name = null;
                    term.description = null;
                    $scope.list = [].concat(arg.data.ReturnObject).map(term => {
                        term.statusInfo = $scope.statusList.filter(s => s.id ===
                            term.status)[0];
                        return term;
                    });
                });
            };

            $scope.updateTerm = (term) => {
                $http.post('/api/todo/update', {
                    Id: term.id,
                    Name: term.name,
                    Description: term.description
                }).then(arg => {
                    $scope.setupList();
                });
            }

            $scope.updateTermStatus = (term) => {
                $http.post('/api/todo/update/status', {
                    Id: term.id
                }).then(arg => {
                    $scope.setupList();
                });
            }

            $scope.$onInit = function () {
                $scope.queryStatusId = queryString.status ? queryString.status.split(',') : [];
                $scope.list = [];
                $http.get('/api/todo/status').then(arg => {
                    $scope.statusList = [].concat(arg.data);
                    $scope.statusList.forEach(s => s.isChecked = filterStatus(s.id));
                    return
                }).then(arg => {
                    $scope.setupList();
                });

                function filterStatus(status) {
                    return $scope.queryStatusId.length === 0 ?
                        true :
                        $scope.queryStatusId.some(q => status === +q);
                }
            }

            $scope.$onInit();
        }
    ]);