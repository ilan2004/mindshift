import os
import jwt
import httpx
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

security = HTTPBearer(auto_error=False)

class SupabaseAuth:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")
        
    async def get_user_from_token(self, token: str) -> Optional[dict]:
        """Extract user information from Supabase JWT token"""
        if not self.supabase_jwt_secret:
            return None
            
        try:
            # Verify and decode the JWT token
            payload = jwt.decode(
                token, 
                self.supabase_jwt_secret, 
                algorithms=["HS256"],
                options={"verify_exp": True}
            )
            
            # Extract user info from token
            user_id = payload.get("sub")
            email = payload.get("email")
            user_metadata = payload.get("user_metadata", {})
            
            if not user_id:
                return None
                
            return {
                "id": user_id,
                "email": email,
                "username": user_metadata.get("username", ""),
                "gender": user_metadata.get("gender", "")
            }
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
        except Exception:
            return None

# Global instance
supabase_auth = SupabaseAuth()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    """Dependency to get current authenticated user"""
    if not credentials:
        return None
        
    return await supabase_auth.get_user_from_token(credentials.credentials)

async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency that requires authentication"""
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user
