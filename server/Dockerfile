FROM python:3.12-alpine
WORKDIR /app
COPY app.py rack_validation.py backup.py model_conversion.py /app/
ENV PYTHONUNBUFFERED=1 HCC_DB=/data/hcc.sqlite3
EXPOSE 8000
CMD ["python","-u","/app/app.py"]
