from datetime import datetime


def current_timestamp():
    return datetime.now().strftime("%d-%m-%Y %H:%M:%S")


def success_response(message, data):
    return {
        "success": True,
        "message": message,
        "timestamp": current_timestamp(),
        "data": data
    }


def error_response(message):
    return {
        "success": False,
        "message": message,
        "timestamp": current_timestamp()
    }