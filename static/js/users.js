
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




document.getElementById('delete-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);

    try {
        const response = await fetch('/delete', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json(); // Parse the JSON response
        const modalTitle = document.getElementById('messageModalLabel');
        const modalMessage = document.getElementById('modalMessage');

        if (response.ok) {
            modalTitle.textContent = "Success";
            modalTitle.style.color = "green";
            modalMessage.textContent = result.message; // Extract the "message" field

            // Fetch updated user list and refresh DOM dynamically
            const usersResponse = await fetch('/users');
            const updatedHTML = await usersResponse.text();
            document.body.innerHTML = updatedHTML; // Replace page content with updated user list
        } else {
            modalTitle.textContent = "Error";
            modalTitle.style.color = "red";
            modalMessage.textContent = result.message;
        }

        const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        messageModal.show();
    } catch (error) {
        console.error('Error during delete operation:', error);
        alert('An unexpected error occurred.');
    }
});



 
      // Event listener for deleting all users
      document.getElementById('delete-all-btn').addEventListener('click', async function () {
          const response = await fetch('/delete_all', {
              method: 'POST',
          });

          const message = await response.text();

          const modalTitle = document.getElementById('messageModalLabel');
          if (response.ok) {
              modalTitle.textContent = "Success";
              modalTitle.style.color = "green";
          } else {
              modalTitle.textContent = "Error";
              modalTitle.style.color = "red";
          }

          const modalMessage = document.getElementById('modalMessage');
          modalMessage.textContent = message;

          const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
          messageModal.show();

          const modalElement = document.getElementById('messageModal');
          modalElement.addEventListener('hidden.bs.modal', function () {
              if (response.ok) {
                  window.location.reload();
              }
          });
      });



//-- eVent listener for backing up users to either an S3 Bucket or locally -->
  
      document.getElementById('backup-btn').addEventListener('click', async function () {
          const response = await fetch('/backup', { method: 'POST' });
  
          const data = await response.json();
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
  
          const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
          messageModal.show();
      });
 
  // Event listener for restoring users from the S3 bucket
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

              // Reload the user list after restoring
              const refreshResponse = await fetch('/download', { method: 'GET' });
              if (refreshResponse.ok) {
                  const users = await refreshResponse.json();
                  const userList = document.querySelector('.list-group');
                  userList.innerHTML = ''; // Clear the existing list
                  users.forEach(user => {
                      const userItem = document.createElement('li');
                      userItem.className = 'list-group-item p-2';
                      userItem.innerHTML = `
                          <div class="d-flex justify-content-start align-items-center">
                              <div class="me-2" style="width: 50px; text-align: right;">
                                  <strong>${user.id}</strong>
                              </div>
                              <div class="me-2" style="width: 150px;">
                                  ${user.username}
                              </div>
                              <div class="text-muted" style="width: 250px; overflow: hidden; text-overflow: ellipsis;">
                                  ${user.email}
                              </div>
                          </div>
                      `;
                      userList.appendChild(userItem);
                  });
              }
          } else {
              const error = await response.json();
              modalTitle.textContent = "Error";
              modalTitle.style.color = "red";
              modalMessage.textContent = error.message;
          }

          // Show the modal with a message
          const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
          messageModal.show();

          // Reload the page when the modal is closed
          const modalElement = document.getElementById('messageModal');
          modalElement.addEventListener('hidden.bs.modal', function () {
              if (response.ok) {
                  window.location.reload(); // Refresh the page after closing the modal
              }
          });
      } catch (error) {
          console.error('An unexpected error occurred:', error);
          alert('An error occurred while restoring users.');
      }
  });




 
 

//reorder button event listener
document.getElementById('reorder-btn').addEventListener('click', async function () {
  try {
      const response = await fetch('/reorder', { method: 'POST' });

      const data = await response.json();
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

      // Show the modal with the message
      const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
      messageModal.show();

      // Reload the page when the modal is closed
      const modalElement = document.getElementById('messageModal');
      modalElement.addEventListener('hidden.bs.modal', function () {
          if (response.ok) {
              window.location.reload(); // Refresh the page after closing the modal
          }
      });
  } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred while reordering IDs.');
  }
});




// Event listener for the Update button
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data), // Send JSON data
            });

            const result = await response.json();

            // Handle response feedback
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

            // Show the modal with the message
            const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
            messageModal.show();

            // Reload the page when the modal is closed
            const modalElement = document.getElementById('messageModal');
            modalElement.addEventListener('hidden.bs.modal', function () {
                if (response.ok) {
                    window.location.reload(); // Refresh the page after closing the modal
                }
            });
        } catch (error) {
            console.error('Error updating user:', error);

            // Handle unexpected error feedback
            const modalTitle = document.getElementById('messageModalLabel');
            const modalMessage = document.getElementById('modalMessage');
            modalTitle.textContent = "Error";
            modalTitle.style.color = "red";
            modalMessage.textContent = 'An unexpected error occurred.';

            const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
            messageModal.show();
        }
    });
});



