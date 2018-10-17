## 題目：

請使用自身熟悉的技術框架，搭配相對應的使用者經驗，模擬 API 建立一套 Todo List 單頁應用 [DEMO](https://cyan92128505.github.io/TodoList/?status=1,3)

## 條件:

1.  頁面路由可利用 URL 參數來調整搜尋結果 /todolist?status=1,3

2.  事項狀態定義 API: GET /api/todo/status

```
    Response: List<{
        id: number,
        name: string,
    }> (事項狀態定義)
```

3.  事項列表 API: POST /api/todo/list

```
    Request: List<number> (狀態ID)
    Response: List<{
        id: number,
        status: number,
        name: string,
        description: string
    }> (事項陣列)
```

4.  新增事項 API: POST /api/todo/create

```
    Request: {
        Name: string,
        Description: string
    }
    Response: {
        IsSuccess: boolean,
        ReturnObject:  List<{
            id: number,
            status: number,
            name: string,
            description: string
        }> (事項陣列)
    }
```

4.  更新事項 API: POST /api/todo/update

```
    Request: {
        Id: number,
        Name: string,
        Description: string
    }
    Response: {
        IsSuccess: boolean,
        ReturnObject: null
    }
```

5.  刪除事項 API: POST /api/todo/delete

```
    Request: {
        Id: number
    }
    Response: {
        IsSuccess: boolean,
        ReturnObject: null
    }
```

6.  更新事項狀態 API: POST /api/todo/update

```
    Request: {
        Id: number
    }
    Response: {
        IsSuccess: boolean,
        ReturnObject: null
    }
```

## 畫面截圖:

![DEMO](https://cyan92128505.github.io/TodoList/demo.png 'DEMO')
