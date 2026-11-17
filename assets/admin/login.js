'use strict';
document.querySelector('#login').addEventListener('submit',async event=>{
  event.preventDefault();
  const button=event.currentTarget.querySelector('button'), message=document.querySelector('#message');
  button.disabled=true; message.textContent='';
  try {
    const response=await fetch('/api/image-admin?action=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('#password').value})});
    const data=await response.json(); document.querySelector('#password').value='';
    if(!response.ok) throw new Error(data.error);
    location.replace('/api/image-admin?action=dashboard');
  } catch(error) { message.textContent=error.message || 'Không thể đăng nhập.'; }
  finally { button.disabled=false; }
});
