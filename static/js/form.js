// Event listener for the Register button
document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent traditional form submission

    const formData = new FormData(this); // Collect form data
    

    try {
        const response = await fetch('/register', {
            method: 'POST',
            body: formData, // Send form data directly
        });

        const message = await response.text(); // Get the response message

        // Dynamically update the modal title and body based on the response
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

        // Show the modal
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        messageModal.show();

        // Reset the form only after a successful response
        if (response.ok) {
            this.reset();
        }
    } catch (error) {
        console.error('Error registering user:', error);
        alert('An unexpected error occurred while registering the user.');
    }
});


window.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/get_saved_bucket_name', { method: 'GET' });
        const result = await response.json();

        if (response.ok && result.bucket_name) {
            document.getElementById('current-bucket-name').textContent = result.bucket_name;
        } else {
            document.getElementById('current-bucket-name').textContent = "None";
        }
    } catch (error) {
        console.error('Error fetching saved bucket name:', error);
        document.getElementById('current-bucket-name').textContent = "None";
    }
});



    
document.getElementById('s3-bucket-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const bucketName = document.getElementById('s3_bucket').value.trim();
    if (!bucketName) {
        alert('Please enter a bucket name.');
        return;
    }

    try {
        const response = await fetch('/save_bucket_name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bucket_name: bucketName }),
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('current-bucket-name').textContent = bucketName; // Update displayed name
            const modalTitle = document.getElementById('messageModalLabel');
            const modalMessage = document.getElementById('modalMessage');
            modalTitle.textContent = "Success";
            modalTitle.style.color = "green";
            modalMessage.textContent = result.message;
            const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
            messageModal.show();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error saving bucket name:', error);
        alert('An error occurred while saving the bucket name.');
    }
});

    
    // Function to display a Bootstrap modal
    function showBootstrapModal(title, message, color) {
        const modalTitle = document.getElementById('messageModalLabel');
        const modalMessage = document.getElementById('modalMessage');
    
        // Update modal content
        modalTitle.textContent = title;
        modalTitle.style.color = color;
        modalMessage.textContent = message;
    
        // Show the modal
        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        messageModal.show();
    }
    

    async function loadBuckets() {
        try {
            const response = await fetch('/list_buckets', { method: 'GET' });
            const result = await response.json();
    
            const bucketSelect = document.getElementById('bucket-select');
            bucketSelect.innerHTML = ''; // Clear existing options
            result.buckets.forEach(bucket => {
                const option = document.createElement('option');
                option.value = bucket;
                option.textContent = bucket;
                bucketSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading buckets:', error);
        }
    }
    



// Update backend when a bucket is selected from the dropdown
document.getElementById('bucket-select').addEventListener('change', async function () {
    const bucketName = this.value; // Get selected bucket name

    // Update the current bucket name span
    document.getElementById('current-bucket-name').textContent = bucketName;

    // Save the selected bucket to the backend
    try {
        const response = await fetch('/save_bucket_name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bucket_name: bucketName }),
        });

        const result = await response.json();
        if (!response.ok) {
            console.error(`Error saving bucket name: ${result.message}`);
            alert('Error saving bucket name.');
        }
    } catch (error) {
        console.error('Error saving bucket name:', error);
        alert('An error occurred while saving the bucket name.');
    }
});

document.getElementById('create-bucket-btn').addEventListener('click', async function () {
    const bucketName = document.getElementById('new-bucket-name').value.trim();

    if (!bucketName) {
        // Display a Bootstrap modal for error
        showBootstrapModal("Error", "Please enter a bucket name.", "red");
        return;
    }

    try {
        const response = await fetch('/create_bucket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bucket_name: bucketName }),
        });

        const result = await response.json();
        if (response.ok && result.success) {
            // Display a Bootstrap modal for success
            showBootstrapModal("Success", result.message, "green");
            loadBuckets(); // Reload the dropdown to include the new bucket
        } else {
            // Display a Bootstrap modal for error
            showBootstrapModal("Error", `Error: ${result.message}`, "red");
        }
    } catch (error) {
        console.error('Error creating bucket:', error);
        // Display a Bootstrap modal for unexpected error
        showBootstrapModal("Error", "An unexpected error occurred.", "red");
    }
});

// Helper function to display a Bootstrap modal
function showBootstrapModal(title, message, color) {
    const modalTitle = document.getElementById('messageModalLabel');
    const modalMessage = document.getElementById('modalMessage');

    // Update modal content
    modalTitle.textContent = title;
    modalTitle.style.color = color;
    modalMessage.textContent = message;

    // Show the modal
    const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
    messageModal.show();
}



// Save selected or entered bucket name
document.getElementById('s3-bucket-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent traditional form submission
    const bucketName = document.getElementById('s3_bucket').value.trim();

    if (!bucketName) {
        alert('Please select or enter a bucket name.');
        return;
    }

    try {
        const response = await fetch('/save_bucket_name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bucket_name: bucketName }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
        } else {
            alert(`Error saving bucket name: ${result.message}`);
        }
    } catch (error) {
        console.error('Error saving bucket name:', error);
        alert('An error occurred while saving the bucket name.');
    }
});

// Initialize bucket list on page load
document.addEventListener('DOMContentLoaded', loadBuckets);
