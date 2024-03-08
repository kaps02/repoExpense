// script.js

document.addEventListener('DOMContentLoaded', function () {
    // Fetch expenses based on the user's preference stored in local storage
    fetchExpenses();

    // Retrieve the user's preference for expenses per page from local storage
    const pageSizePreference = localStorage.getItem('pageSize');
    if (pageSizePreference) {
        document.getElementById('expensesPerPage').value = pageSizePreference;
    }

    // Add event listener for form submission
    document.getElementById('expenseForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const token = localStorage.getItem('token');
        const formData = new FormData(this);

        try {
            const response = await axios.post('/expense/add', {
                category: formData.get('category'),
                description: formData.get('description'),
                amount: formData.get('amount')
            }, { headers: { 'Authorization': token } });

            if (response.status === 201) {
                fetchExpenses(); // Refresh the table after adding an expense
                this.reset(); // Reset the form fields
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Add event listener to handle changes in the number of expenses per page
    document.getElementById('expensesPerPage').addEventListener('change', function () {
        const pageSize = this.value;
        // Store the user's preference for expenses per page in local storage
        localStorage.setItem('pageSize', pageSize);
        // Fetch expenses based on the updated preference
        fetchExpenses();
    });
});

// Function to fetch expenses and populate the table
async function fetchExpenses(page = 1) {
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);
    console.log("response from token .........", decodeToken);
    const isPremiumUser = decodeToken.isPremiumUser;
    if (!token) {
        console.log('Login to access this page');
        alert("Login to access this page");
        window.location.href = '/user/login'; // Redirect to login page
        return; // Stop further execution
    }
    if (isPremiumUser) {
        fetchPremium(isPremiumUser);
    }

    try {
        const pageSizePref = parseInt(localStorage.getItem('pageSize'));
       
        // Retrieve the user's preference for expenses per page from the input field
            const expensesPerPage = pageSizePref || parseInt(document.getElementById('expensesPerPage').value);
        
        const response = await axios.get(`/expense/get?page=${page}&perPage=${expensesPerPage}`, { headers: { 'Authorization': token } });

        const expenses = response.data.expenses;
        const totalPages = response.data.totalPages;

        const expenseTableBody = document.getElementById('expenseTableBody');
        expenseTableBody.innerHTML = ''; // Clear previous data

        let totalExpense = 0; // Initialize total expense

        // Add expenses data to the table
        expenses.forEach(expense => {
            totalExpense += parseFloat(expense.amount); // Add current expense amount to total
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td>${expense.amount}</td>
                <td>
                    <button onclick="deleteExpense('${expense.id}')">Delete</button>
                </td>
            `;
            expenseTableBody.appendChild(row);
        });

        // Display total expense
        const totalExpenseElement = document.getElementById('totalExpense');
        totalExpenseElement.textContent = ` ${totalExpense} `;

        // Display pagination
        displayPagination(totalPages, page);

    } catch (error) {
        console.error('Error:', error);
    }
}



// Function to handle deleting an expense
async function deleteExpense(id) {
    if (!id) {
        console.error('Error: ID is undefined');
        return;
    }
    // Remove the quotes from around the ID
    id = id.replace(/['"]+/g, ''); // Remove quotes if present
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.delete(`/expense/delete/${id}`, { headers: { 'Authorization': token } });

            if (response.status === 200) {
                fetchExpenses(); // Refresh the table after deleting an expense
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Function to display pagination
function displayPagination(totalPages, currentPage) {
    console.log("display pagination...");
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('span');
        pageItem.classList.add('page-item');
        pageItem.textContent = i;

        // Highlight the current page
        if (i === currentPage) {
            pageItem.classList.add('current-page');
        }

        // Add event listener to fetch expenses for the clicked page
        pageItem.addEventListener('click', () => {
            fetchExpenses(i);
        });

        paginationContainer.appendChild(pageItem);
    }
}


function download() {
    const token = localStorage.getItem('token');

    axios.get('http://localhost:5000/user/download', { headers: { "Authorization": token } })
        .then((response) => {
            if (response.status === 201) {
                //the bcakend is essentially sending a download link
                //  which if we open in browser, the file would download
                var a = document.createElement("a");
                a.href = response.data.fileUrl;
                a.download = 'myexpense.csv';
                a.click();
            } else {
                throw new Error(response.data.message)
            }

        })
        .catch((err) => {
            showError(err)
        });
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Payment frontend
document.getElementById("buy-button").onclick = async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    console.log("token in payment", token);

    try {
        const result = await axios.get("/payment/createOrder", {
            headers: { 'Authorization': token }
        });

        const options = {
            key: result.data.key_id,
            order_id: result.data.order.id,
            handler: async function (response) {
                try {
                    const updateToken = await axios.post("/payment/updateOrder", {
                        order_id: result.data.order.id,
                        payment_id: response.razorpay_payment_id,
                        status: "SUCCESS",
                    }, {
                        headers: { "Authorization": token }
                    });
                    console.log(updateToken);
                    localStorage.setItem('token', updateToken.data.token);
                    alert("You are a premium User Now");
                    fetchPremium();

                } catch (error) {
                    console.error(error);
                    alert("Failed to update order status");
                }
            }
        };

        const razorpayObject = new Razorpay(options);
        razorpayObject.open();
    } catch (error) {
        console.error(error);
        alert("Failed to create payment order");
    }
};

async function fetchPremium() {
    try {
        console.log("we are in fetch premium...");
        const btn = document.getElementById('buy-button');
        const premium = document.getElementById('show-premium');

        btn.style.display = 'none';
        premium.textContent = 'You are a premium user';
        showLeaderBoard();
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

function showLeaderBoard() {
    const inputElement = document.createElement("input");
    inputElement.type = "button";
    inputElement.value = "Show LeaderBoard";

    inputElement.onclick = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get("/premium/leaderboard", {
                headers: { 'Authorization': token }
            });

            const leaderArray = response.data;

            var leaderElement = document.getElementById('leaderboard');
            leaderElement.innerHTML ='';
            var header = document.createElement('h2');
            header.textContent = 'Leader Board';
            leaderElement.appendChild(header);

            leaderArray.forEach((userDetail) => {
                var listItem = document.createElement('li');

                listItem.textContent = `Name - ${userDetail.name}, Total Expense - ${userDetail.total_cost || 0}`;
                leaderElement.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching leaderboard data:", error);
        }
    };

    var messageElement = document.getElementById('message');
    messageElement.innerHTML = '';
    messageElement.appendChild(inputElement);
}
