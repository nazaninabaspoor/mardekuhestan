wsgi_app = "core.wsgi:application"
bind = "0.0.0.0:80"
workers = 2
timeout = 120
accesslog = "-"
errorlog = "-"
capture_output = True
