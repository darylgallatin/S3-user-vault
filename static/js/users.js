// On page load, fetch the saved S3 bucket name and display it
window.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch the saved bucket name from the backend
        const response = await fetch('/get_saved_bucket_name', { method: 'GET' });
        const result = await response.json();

        // If a bucket name exists, display it; otherwise, display "None"
        if (response.ok && result.bucket_name) {
            document.getElementById('current-bucket-name').textContent = result.bucket_name;
        } else {
            document.getElementById('current-bucket-name').textContent = "None";
        }
    } catch (error) {
        console.error('Error fetching saved bucket name:', error);
        document.getElementById('current-bucket-name').textContent = "None"; // Fallback in case of error
    }
});

// Event listener for the delete user form submission
document.getElementById('delete-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent traditional form submission

    const formData = new FormData(this); // Collect form data

    try {
        // Send the delete request to the backend
        const response = await fetch('/delete', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json(); // Parse the JSON response

        // Update the modal content based on the response
        const modalTitle = document.getElementById('messageModalLabel');
        const modalMessage = document.getElementById('modalMessage');

        if (response.ok) {
            modalTitle.textContent = "Success";
            modalTitle.style.color = "green";
            modalMessage.textContent = result.message; // Show the success message
        } else {
            modalTitle.textContent = "Error";
            modalTitle.style.color = "red";
            modalMessage.textContent = result.message; // Show the error message
        }

        // Show the modal with the result message
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        messageModal.show();

        // Reload the page when the modal is closed
        const modalElement = document.getElementById('messageModal');
        modalElement.addEventListener('hidden.bs.modal', function () {
            if (response.ok) {
                window.location.reload(); // Reload the page after closing the modal
            }
        });
    } catch (error) {
        console.error('Error during delete operation:', error);
        alert('An unexpected error occurred.');
    }
});


// Event listener for deleting all users
document.getElementById('delete-all-btn').addEventListener('click', async function () {
    try {
        // Trigger the delete all users endpoint
        const response = await fetch('/delete_all', { method: 'POST' });
        const message = await response.text(); // Retrieve the response message

        // Update the modal content
        const modalTitle = document.getElementById('messageModalLabel');
        const modalMessage = document.getElementById('modalMessage');

        if (response.ok) {
            modalTitle.textContent = "Success";
            modalTitle.style.color = "green";
        } else {
            modalTitle.textContent = "Error";
            modalTitle.style.color = "red";
        }

        modalMessage.textContent = message;

        // Show the modal with the result message
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        messageModal.show();

        // Reload the page when the modal is closed if the operation was successful
        const modalElement = document.getElementById('messageModal');
        modalElement.addEventListener('hidden.bs.modal', function () {
            if (response.ok) {
                window.location.reload();
            }
        });
    } catch (error) {
        console.error('Error during delete all operation:', error);
        alert('An unexpected error occurred.');
    }
});

// Event listener for backing up user data
document.getElementById('backup-btn').addEventListener('click', async function () {
    try {
        const response = await fetch('/backup', { method: 'POST' });
        const data = await response.json();

        // Update the modal content
        const modalTitle = document.getElementById('messageModalLabel');
        const modalMessage = document.getElementById('modalMessage');

        if (response.ok) {
            modalTitle.textContent = "Success";
            modalTitle.style.color = "green";
        } else {
            modalTitle.textContent = "Error";
            modalTitle.style.color = "red";
        }

        modalMessage.textContent = data.message;

        // Show the modal with the result message
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        messageModal.show();
    } catch (error) {
        console.error('Error during backup operation:', error);
        alert('An error occurred while backing up user data.');
    }
});

// Event listener for restoring user data from the S3 bucket
document.getElementById('restore-btn').addEventListener('click', async function () {
    try {
        // Trigger the restore endpoint
        const response = await fetch('/restore', { method: 'POST' });

        const modalTitle = document.getElementById('messageModalLabel');
        const modalMessage = document.getElementById('modalMessage');

        if (response.ok) {
            const result = await response.json();
            modalTitle.textContent = "Success";
            modalTitle.style.color = "green";
            modalMessage.textContent = result.message;
        } else {
            const error = await response.json();
            modalTitle.textContent = "Error";
            modalTitle.style.color = "red";
            modalMessage.textContent = error.message;
        }

        // Show the modal with the result message
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        messageModal.show();

        // Reload the page when the modal is closed if the operation was successful
        const modalElement = document.getElementById('messageModal');
        modalElement.addEventListener('hidden.bs.modal', function () {
            if (response.ok) {
                window.location.reload();
            }
        });
    } catch (error) {
        console.error('Error during restore operation:', error);
        alert('An error occurred while restoring user data.');
    }
});

// Event listener for reordering user IDs
document.getElementById('reorder-btn').addEventListener('click', async function () {
    try {
        const response = await fetch('/reorder', { method: 'POST' });
        const data = await response.json();

        // Update the modal content
        const modalTitle = document.getElementById('messageModalLabel');
        const modalMessage = document.getElementById('modalMessage');

        if (response.ok) {
            modalTitle.textContent = "Success";
            modalTitle.style.color = "green";
        } else {
            modalTitle.textContent = "Error";
            modalTitle.style.color = "red";
        }

        modalMessage.textContent = data.message;

        // Show the modal with the result message
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        messageModal.show();

        // Reload the page when the modal is closed if the operation was successful
        const modalElement = document.getElementById('messageModal');
        modalElement.addEventListener('hidden.bs.modal', function () {
            if (response.ok) {
                window.location.reload();
            }
        });
    } catch (error) {
        console.error('Error during reorder operation:', error);
        alert('An error occurred while reordering user IDs.');
    }
});

// Event listener for updating user data
document.querySelectorAll('.update-btn').forEach(button => {
    button.addEventListener('click', async function () {
        const userId = this.getAttribute('data-user-id'); // Get the user ID
        const form = document.querySelector(`#user-form-${userId}`);
        const formData = new FormData(form);

        // Convert FormData to a plain object
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            const response = await fetch(`/update_user/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data), // Send the data as JSON
            });

            const result = await response.json();

            // Update the modal content
            const modalTitle = document.getElementById('messageModalLabel');
            const modalMessage = document.getElementById('modalMessage');

            if (response.ok) {
                modalTitle.textContent = "Success";
                modalTitle.style.color = "green";
                modalMessage.textContent = `User ${userId} updated successfully.`;
            } else {
                modalTitle.textContent = "Error";
                modalTitle.style.color = "red";
                modalMessage.textContent = `Error updating user: ${result.message}`;
            }

            // Show the modal with the result message
            const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
            messageModal.show();

            // Reload the page when the modal is closed if the operation was successful
            const modalElement = document.getElementById('messageModal');
            modalElement.addEventListener('hidden.bs.modal', function () {
                if (response.ok) {
                    window.location.reload();
                }
            });
        } catch (error) {
            console.error('Error updating user:', error);
            alert('An unexpected error occurred while updating user data.');
        }
    });
});

// Event listener for analyzing sentiment
document.querySelectorAll('.analyze-sentiment-btn').forEach(button => {
    button.addEventListener('click', async function () {
        const userId = this.getAttribute('data-user-id'); // Get the user ID
        const form = document.querySelector(`#user-form-${userId}`); // Get the associated form
        const formData = new FormData(form); // Extract form data
        const notes = formData.get('notes'); // Get the notes field

        if (!notes || notes.trim() === '') {
            alert('No notes provided for sentiment analysis.');
            return;
        }

        try {
            const response = await fetch(`/analyze_sentiment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, notes: notes.trim() }) // Send the notes
            });

            const result = await response.json(); // Parse the JSON response

            // Update the modal content
            const modalTitle = document.getElementById('messageModalLabel');
            const modalMessage = document.getElementById('modalMessage');

            if (response.ok) {
                modalTitle.textContent = "Sentiment Analysis Result";
                modalTitle.style.color = "green";
                modalMessage.textContent = `User ${userId}: ${result.sentiment}`;
            } else {
                modalTitle.textContent = "Error";
                modalTitle.style.color = "red";
                modalMessage.textContent = `Error: ${result.message}`;
            }

            // Show the modal with the result message
            const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
            messageModal.show();
        } catch (error) {
            console.error('Error during sentiment analysis:', error);
            alert('An unexpected error occurred while analyzing sentiment.');
        }
    });
});
