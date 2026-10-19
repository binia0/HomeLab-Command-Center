FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-gmsh ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY app.py rack_validation.py backup.py model_conversion.py step_worker.py /app/
ENV PYTHONUNBUFFERED=1 HCC_DB=/data/hcc.sqlite3
EXPOSE 8000
CMD ["/usr/bin/python3","-u","/app/app.py"]
