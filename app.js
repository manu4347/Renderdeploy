
// ===== NovaForge Preview Guard =====
const IS_PREVIEW = window.location.protocol === "about:";
if (IS_PREVIEW) {
  console.warn("Preview mode active: backend calls disabled");
}

// --- Basic Database Schema (for backend context) ---
        /*
        This is a conceptual schema for a full-stack Aditya School application backend.

        Schema Name: aditya_school_db

        Tables:

        1.  **Users**
            -   `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
            -   `username` (VARCHAR(50), UNIQUE, NOT NULL)
            -   `email` (VARCHAR(100), UNIQUE, NOT NULL)
            -   `password_hash` (VARCHAR(255), NOT NULL)
            -   `role` (ENUM('admin', 'teacher', 'student', 'parent'), NOT NULL)
            -   `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
            -   `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

        2.  **Students**
            -   `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
            -   `user_id` (INT, UNIQUE, FOREIGN KEY REFERENCES Users(id))
            -   `first_name` (VARCHAR(50), NOT NULL)
            -   `last_name` (VARCHAR(50), NOT NULL)
            -   `student_id` (VARCHAR(20), UNIQUE, NOT NULL) // School-assigned ID
            -   `date_of_birth` (DATE)
            -   `grade_level` (INT)
            -   `class_id` (INT, FOREIGN KEY REFERENCES Classes(id))
            -   `enrollment_date` (DATE)
            -   `parent_id` (INT, FOREIGN KEY REFERENCES Parents(id)) // If Parents is a separate table/role

        3.  **Teachers**
            -   `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
            -   `user_id` (INT, UNIQUE, FOREIGN KEY REFERENCES Users(id))
            -   `first_name` (VARCHAR(50), NOT NULL)
            -   `last_name` (VARCHAR(50), NOT NULL)
            -   `employee_id` (VARCHAR(20), UNIQUE, NOT NULL)
            -   `department` (VARCHAR(100))
            -   `qualification` (VARCHAR(255))
            -   `date_of_joining` (DATE)

        4.  **Classes** (or Courses)
            -   `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
            -   `name` (VARCHAR(100), NOT NULL) // e.g., "Grade 5 A", "Algebra I"
            -   `description` (TEXT)
            -   `teacher_id` (INT, FOREIGN KEY REFERENCES Teachers(id))
            -   `grade_level` (INT) // Associated grade level for easier filtering

        5.  **Admissions**
            -   `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
            -   `student_first_name` (VARCHAR(50), NOT NULL)
            -   `student_last_name` (VARCHAR(50), NOT NULL)
            -   `parent_first_name` (VARCHAR(50), NOT NULL)
            -   `parent_last_name` (VARCHAR(50), NOT NULL)
            -   `email` (VARCHAR(100), NOT NULL)
            -   `phone_number` (VARCHAR(20))
            -   `grade_applying_for` (VARCHAR(10), NOT NULL)
            -   `additional_comments` (TEXT)
            -   `application_date` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
            -   `status` (ENUM('pending', 'reviewed', 'approved', 'rejected'), DEFAULT 'pending')
            -   `decision_date` (DATE)

        6.  **ContactMessages**
            -   `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
            -   `name` (VARCHAR(100), NOT NULL)
            -   `email` (VARCHAR(100), NOT NULL)
            -   `subject` (VARCHAR(255))
            -   `message` (TEXT, NOT NULL)
            -   `received_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
            -   `is_read` (BOOLEAN, DEFAULT FALSE)

        7.  **Grades** (Student performance)
            -   `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
            -   `student_id` (INT, FOREIGN KEY REFERENCES Students(id))
            -   `class_id` (INT, FOREIGN KEY REFERENCES Classes(id))
            -   `assignment_name` (VARCHAR(255))
            -   `score` (DECIMAL(5,2))
            -   `max_score` (DECIMAL(5,2))
            -   `grade_date` (DATE)

        Relationships:
        -   One User can have one associated Student/Teacher record (1-to-1)
        -   One Teacher can teach multiple Classes (1-to-Many)
        -   One Class can have many Students (Many-to-Many via a `StudentClasses` or implicitly by `class_id` in Students)
        -   One Student can have many Grades (1-to-Many)
        -   Admissions and ContactMessages are independent entry points.
        */
        // --- End Database Schema ---

        document.addEventListener('DOMContentLoaded', () => {
            const backendUrl = 'http://localhost:5001/api/data';
            const timeoutDuration = 3000; // 3 seconds timeout for backend requests

            const showMessage = (element, message, type) => {
                element.textContent = message;
                element.className = 'response-message ' + type;
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 5000); // Hide after 5 seconds
            };

            // --- Backend Data Demo ---
            const backendDataButton = document.getElementById('backend-data-button');
            if (backendDataButton) {
                backendDataButton.addEventListener('click', async (event) => {
                    event.preventDefault();
                    await fetchDataFromBackend();
                });
            }

            async function fetchDataFromBackend() {
                console.log('Attempting to fetch data from backend...');
                const statusMessageElement = document.createElement('div');
                statusMessageElement.id = 'backend-status-message';
                statusMessageElement.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #ffe08a; padding: 10px 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 1000;';
                document.body.appendChild(statusMessageElement);

                try {
                    statusMessageElement.textContent = 'Fetching data...';
                    statusMessageElement.style.backgroundColor = '#ffe08a'; // Yellow for pending

                    const controller = new AbortController();
                    const id = setTimeout(() => controller.abort(), timeoutDuration);

                    const response = await fetch(backendUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        signal: controller.signal
                    });

                    clearTimeout(id);

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
                    }

                    const data = await response.json();
                    console.log('Data from backend:', data);
                    statusMessageElement.textContent = `Backend Data Received: ${JSON.stringify(data.message || data)}`;
                    statusMessageElement.style.backgroundColor = '#d4edda'; // Green for success
                } catch (error) {
                    console.error('Error fetching data:', error);
                    statusMessageElement.textContent = `Error: Backend unavailable or request timed out. ${error.name === 'AbortError' ? 'Request timed out.' : error.message}`;
                    statusMessageElement.style.backgroundColor = '#f8d7da'; // Red for error
                } finally {
                    setTimeout(() => {
                        if (statusMessageElement.parentNode) {
                            statusMessageElement.parentNode.removeChild(statusMessageElement);
                        }
                    }, 7000); // Remove message after a longer period
                }
            }

            async function sendDataToBackend(endpoint, dataToSend, responseElementId) {
                const responseElement = document.getElementById(responseElementId);
                const originalBtnText = responseElement.previousElementSibling.textContent;
                responseElement.previousElementSibling.textContent = 'Submitting...';
                responseElement.previousElementSibling.disabled = true;

                try {
                    const controller = new AbortController();
                    const id = setTimeout(() => controller.abort(), timeoutDuration);

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(dataToSend),
                        signal: controller.signal
                    });

                    clearTimeout(id);

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
                    }

                    const data = await response.json();
                    console.log('Backend response:', data);
                    showMessage(responseElement, data.message || 'Submission successful!', 'success');
                } catch (error) {
                    console.error('Error sending data:', error);
                    let errorMessage = `Submission failed. Backend unavailable or request timed out.`;
                    if (error.name !== 'AbortError') {
                        errorMessage = `Submission failed: ${error.message}`;
                    }
                    showMessage(responseElement, errorMessage, 'error');
                } finally {
                    responseElement.previousElementSibling.textContent = originalBtnText;
                    responseElement.previousElementSibling.disabled = false;
                }
            }

            // --- Contact Form Submission ---
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const formData = new FormData(contactForm);
                    const data = Object.fromEntries(formData.entries());

                    // Simulate sending data to backend (using the /api/data endpoint as specified)
                    await sendDataToBackend(backendUrl, { type: 'contact_message', ...data }, 'contact-response-message');
                    contactForm.reset(); // Reset form on success or attempted submission
                });
            }

            // --- Admission Form Submission ---
            const admissionForm = document.getElementById('admission-form');
            if (admissionForm) {
                admissionForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const formData = new FormData(admissionForm);
                    const data = Object.fromEntries(formData.entries());

                    // Simulate sending data to backend (using the /api/data endpoint as specified)
                    await sendDataToBackend(backendUrl, { type: 'admission_application', ...data }, 'admission-response-message');
                    admissionForm.reset(); // Reset form on success or attempted submission
                });
            }

            // --- Smooth Scrolling for Navigation ---
            document.querySelectorAll('nav ul li a').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - (document.querySelector('header').offsetHeight || 0), // Adjust for fixed header
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });