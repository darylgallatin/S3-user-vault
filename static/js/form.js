
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
    