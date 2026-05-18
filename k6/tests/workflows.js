import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '1m',
    thresholds: {
        'http_req_duration{name:GET /login}': ['p(95)<1500'],
        'http_req_duration{name:POST /login}': ['p(95)<2000'],
        'http_req_duration{name:GET /app/dashboard}': ['p(95)<2500'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
    },
};

const BASE_URL = __ENV.BASE_URL;
const EMAIL = __ENV.TEST_EMAIL;
const PASSWORD = __ENV.TEST_PASSWORD;
const AUTHENTICATED_PATH = __ENV.AUTHENTICATED_PATH;

function urlDecode(value) {
    if (!value) return value;

    return value
        .replace(/%3D/g, '=')
        .replace(/%2F/g, '/')
        .replace(/%2B/g, '+')
        .replace(/%3A/g, ':')
        .replace(/%7C/g, '|');
}

export default function () {
    const jar = http.cookieJar();

    const loginPage = http.get(`${BASE_URL}/login`, {
        jar,
        tags: { name: 'GET /login' },
    });

    check(loginPage, {
        'login page ok': (r) => r.status === 200,
    });

    const cookies = jar.cookiesForURL(BASE_URL);
    const xsrfToken = cookies['XSRF-TOKEN'] && cookies['XSRF-TOKEN'][0];
    const decodedXsrfToken = urlDecode(xsrfToken);

    check(xsrfToken, {
        'xsrf token cookie found': (t) => !!t,
    });

    const loginRes = http.post(
        `${BASE_URL}/login`,
        JSON.stringify({
            email: EMAIL,
            password: PASSWORD,
        }),
        {
            jar,
            redirects: 0,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': decodedXsrfToken,
                'Referer': `${BASE_URL}/login`,
                'Origin': BASE_URL,
            },
            tags: { name: 'POST /login' },
        }
    );

    check(loginRes, {
        'login successful': (r) =>
            r.status === 200 ||
            r.status === 204 ||
            r.status === 302 ||
            r.status === 303,
    });

    const authenticatedPage = http.get(`${BASE_URL}${AUTHENTICATED_PATH}`, {
        jar,
        redirects: 0,
        headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': `${BASE_URL}/login`,
        },
        tags: { name: `GET ${AUTHENTICATED_PATH}` },
    });

    check(authenticatedPage, {
        'authenticated page ok': (r) => r.status === 200,
        'not redirected to login': (r) => r.status !== 302 && r.status !== 303,
        'not csrf expired': (r) => r.status !== 419,
    });

    sleep(1);
}