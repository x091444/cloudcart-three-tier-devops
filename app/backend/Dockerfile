
# Stage 1: Build Python dependencies
FROM python:3.12-slim-bookworm AS builder

ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

COPY requirements.txt .

RUN python -m pip wheel \
    --no-cache-dir \
    --wheel-dir=/wheels \
    -r requirements.txt


# Stage 2: Production runtime
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Create dedicated non-root user
RUN groupadd --system --gid 10001 django \
    && useradd --system \
       --uid 10001 \
       --gid 10001 \
       --no-create-home \
       --shell /usr/sbin/nologin django \
    && mkdir -p /app/staticfiles \
    && chown -R django:django /app

# Install prebuilt Python wheels
COPY --from=builder /wheels /wheels
COPY requirements.txt .

RUN python -m pip install \
    --no-cache-dir \
    --no-index \
    --find-links=/wheels \
    -r requirements.txt \
    && rm -rf /wheels \
    && chown -R django:django /app

# Copy only required Django application files
COPY --chown=10001:10001 config/ ./config/
COPY --chown=10001:10001 store/ ./store/
COPY --chown=10001:10001 manage.py ./

USER 10001:10001

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "2", \
     "--timeout", "60", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
