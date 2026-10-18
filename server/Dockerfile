FROM python:3.12-alpine
WORKDIR /app
COPY app.py /app/app.py
ENV PYTHONUNBUFFERED=1 HCC_DB=/data/hcc.sqlite3
EXPOSE 8000
CMD ["python","-u","/app/app.py"]
