from locust import HttpUser, task, between, events
from urllib.parse import unquote


class WorkflowUser(HttpUser):
    wait_time = between(1, 2)

    def on_start(self):
        self.login()

    def login(self):
        login_page = self.client.get(
            "/login",
            name="GET /login",
        )

        if login_page.status_code != 200:
            raise Exception(f"Login page failed: {login_page.status_code}")

        xsrf_token = self.client.cookies.get("XSRF-TOKEN")

        if not xsrf_token:
            raise Exception("XSRF-TOKEN cookie not found")

        decoded_xsrf_token = unquote(xsrf_token)

        login_response = self.client.post(
            "/login",
            json={
                "email": self.environment.parsed_options.test_email,
                "password": self.environment.parsed_options.test_password,
            },
            headers={
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-XSRF-TOKEN": decoded_xsrf_token,
                "Referer": f"{self.host}/login",
                "Origin": self.host,
            },
            name="POST /login",
            allow_redirects=False,
        )

        if login_response.status_code not in [200, 204, 302, 303]:
            raise Exception(
                f"Login failed: {login_response.status_code} "
                f"{login_response.text[:500]}"
            )

    @task
    def authenticated_page(self):
        path = self.environment.parsed_options.authenticated_path

        response = self.client.get(
            path,
            headers={
                "Accept": "text/html,application/xhtml+xml",
                "X-Requested-With": "XMLHttpRequest",
            },
            name=f"GET {path}",
            allow_redirects=False,
        )

        if response.status_code != 200:
            response.failure(f"Expected 200, got {response.status_code}")


@events.init_command_line_parser.add_listener
def add_custom_arguments(parser):
    parser.add_argument("--test-email", env_var="TEST_EMAIL", required=True)
    parser.add_argument("--test-password", env_var="TEST_PASSWORD", required=True)
    parser.add_argument(
        "--authenticated-path",
        env_var="AUTHENTICATED_PATH",
        default="/app/dashboard",
    )