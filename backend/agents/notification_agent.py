from datetime import datetime


class NotificationAgent:
    """
    Handles notification and reminder-related requests.

    This agent does not send real notifications yet.
    It prepares notification information that can later
    be connected to email, SMS, push notifications, etc.
    """

    def run(
        self,
        query: str,
        user_id: int | None = None
    ) -> dict:

        # ============================================================
        # 1. Validate Query
        # ============================================================

        if not query or not query.strip():

            return {
                "agent": "NotificationAgent",
                "success": False,
                "message": "Please provide a valid notification request."
            }

        query_lower = query.lower().strip()

        # ============================================================
        # 2. Detect Notification Type
        # ============================================================

        notification_type = "general"

        if any(
            keyword in query_lower
            for keyword in [
                "remind",
                "reminder",
                "remember"
            ]
        ):

            notification_type = "reminder"

        elif any(
            keyword in query_lower
            for keyword in [
                "alert",
                "alerts",
                "notify",
                "notification",
                "notifications"
            ]
        ):

            notification_type = "alert"

        elif any(
            keyword in query_lower
            for keyword in [
                "deadline",
                "last date",
                "closing date",
                "application date"
            ]
        ):

            notification_type = "deadline"

        elif any(
            keyword in query_lower
            for keyword in [
                "update",
                "updates",
                "latest",
                "new"
            ]
        ):

            notification_type = "update"

        # ============================================================
        # 3. Detect Topic
        # ============================================================

        topic = "general"

        if any(
            keyword in query_lower
            for keyword in [
                "scheme",
                "schemes",
                "yojana",
                "government scheme"
            ]
        ):

            topic = "government_scheme"

        elif any(
            keyword in query_lower
            for keyword in [
                "job",
                "jobs",
                "career",
                "employment",
                "vacancy",
                "internship"
            ]
        ):

            topic = "career"

        elif any(
            keyword in query_lower
            for keyword in [
                "scholarship",
                "scholarships",
                "student",
                "students",
                "education"
            ]
        ):

            topic = "education"

        # ============================================================
        # 4. Create Notification Object
        # ============================================================

        notification = {
            "user_id": user_id,
            "type": notification_type,
            "topic": topic,
            "message": query,
            "created_at": datetime.now().isoformat()
        }

        # ============================================================
        # 5. Return Result
        # ============================================================

        return {
            "agent": "NotificationAgent",
            "success": True,
            "notification": notification,
            "message": (
                "Notification request identified successfully. "
                "The request is ready for integration with a "
                "notification delivery service."
            )
        }