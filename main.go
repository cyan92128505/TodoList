package main

import (
	"encoding/json"
	"html/template"
	"net/http"
)

// Status for todo-list
type Status struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// TodoTerm for todo-list
type TodoTerm struct {
	ID          int    `json:"id"`
	Status      int    `json:"status"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// ListForm is a form for todo-list
type ListForm struct {
	Status []int `json:"status"`
}

func getTodoList(status []int) (jsonContent []TodoTerm) {
	todolist := []TodoTerm{
		TodoTerm{
			ID:          1,
			Status:      1,
			Name:        "事項一",
			Description: "處理事項一",
		},
		TodoTerm{
			ID:          2,
			Status:      2,
			Name:        "事項二",
			Description: "處理事項二",
		},
		TodoTerm{
			ID:          3,
			Status:      2,
			Name:        "事項三",
			Description: "處理事項三",
		},
		TodoTerm{
			ID:          4,
			Status:      3,
			Name:        "事項四",
			Description: "處理事項四",
		},
		TodoTerm{
			ID:          5,
			Status:      1,
			Name:        "事項五",
			Description: "處理事項五",
		},
		TodoTerm{
			ID:          6,
			Status:      1,
			Name:        "事項六",
			Description: "處理事項六",
		},
	}
	ans := make([]TodoTerm, 0)
	for _, x := range todolist {
		if selectFromStatus(x.Status, status) {
			ans = append(ans, x)
		}
	}

	jsonContent = ans
	return
}

func selectFromStatus(target int, statusList []int) bool {
	for _, s := range statusList {
		if s == target {
			return true
		}
	}
	return false
}

func list(w http.ResponseWriter, r *http.Request) {
	formBody := ListForm{}
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	json.Unmarshal(body, &formBody)
	jsonContent := getTodoList(formBody.Status)

	output, err := json.MarshalIndent(&jsonContent, "", "\t\t")
	if err != nil {
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
	return
}

func status(w http.ResponseWriter, r *http.Request) {

	jsonContent := []Status{
		Status{
			ID:   1,
			Name: "未完成",
		},
		Status{
			ID:   2,
			Name: "進行中",
		},
		Status{
			ID:   3,
			Name: "已完成",
		},
	}

	output, err := json.MarshalIndent(&jsonContent, "", "\t\t")
	if err != nil {
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
	return
}

func view(w http.ResponseWriter, r *http.Request) {
	t, _ := template.ParseFiles("./templates/todolist.html")
	t.Execute(w, nil)
}

func demo(w http.ResponseWriter, r *http.Request) {
	t, _ := template.ParseFiles("./docs/index.html")
	t.Execute(w, nil)
}

func faviconHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./public/favicon.ico")
}

func main() {

	// handle static assets
	mux := http.NewServeMux()
	files := http.FileServer(http.Dir("public"))
	mux.Handle("/static/", http.StripPrefix("/static/", files))

	mux.HandleFunc("/", view)

	mux.HandleFunc("/favicon.ico", faviconHandler)

	mux.HandleFunc("/todolist", demo)
	mux.HandleFunc("/demo", demo)

	mux.HandleFunc("/api/todo/list", list)
	mux.HandleFunc("/api/todo/status", status)

	server := &http.Server{
		Addr:    "127.0.0.1:9921",
		Handler: mux,
	}
	server.ListenAndServe()
}
