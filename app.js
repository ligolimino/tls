(function(){
  const config=window.TLS_CONFIG,params=new URLSearchParams(location.search);
  let theme=Number(params.get('thema'))||1,filter='alles',current=null,youtubePlayer=null;
  const tabs=document.getElementById('theme-tabs'),list=document.getElementById('material-list'),player=document.getElementById('player'),playerFrame=document.getElementById('player-frame'),frame=document.getElementById('media-frame'),title=document.getElementById('player-title'),share=document.getElementById('share-button');

  function renderTabs(){tabs.innerHTML='';Object.keys(config.themes).forEach(key=>{const number=Number(key),button=document.createElement('button');button.className='tab'+(number===theme?' active':'');button.textContent='T'+number+' '+config.themes[number];button.onclick=()=>{theme=number;renderTabs();renderList()};tabs.appendChild(button)})}
  function renderList(){list.innerHTML='';const items=config.items.filter(item=>item.theme===theme&&(filter==='alles'||item.type===filter));if(!items.length){list.innerHTML='<p class="empty">Voor dit thema is nog geen materiaal beschikbaar.</p>';return}items.forEach(item=>{const button=document.createElement('button'),type=item.type==='video'?'Video':'Genially';button.className='material'+(current&&current.key===item.key?' active':'');button.disabled=!item.id;button.innerHTML='<span class="badge">'+(item.type==='video'?'▶':'◆')+'</span><span class="material-copy">'+item.number+' – '+item.title+'<span class="material-type">'+type+(item.id?'':' · <span class="soon">Binnenkort beschikbaar</span>')+'</span></span>';if(item.id)button.onclick=()=>openItem(item);list.appendChild(button)})}
  function mediaUrl(item){return item.type==='video'?'https://www.youtube-nocookie.com/embed/'+item.id+'?autoplay=0&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin='+encodeURIComponent(location.origin):'https://view.genially.com/'+item.id}
  function openItem(item){current=item;title.textContent=item.number+' – '+item.title+' · '+(item.type==='video'?'Video':'Genially');frame.src=mediaUrl(item);player.classList.add('open');const query=item.type==='video'?'v':'g';history.replaceState(null,'',location.pathname+'?'+query+'='+encodeURIComponent(item.id));renderList();scrollTo({top:0,behavior:'smooth'})}

  function connectYouTube(endScreen){
    function attach(){if(!window.YT||!window.YT.Player)return;youtubePlayer=new YT.Player(frame,{events:{onStateChange(event){endScreen.classList.toggle('show',event.data===YT.PlayerState.ENDED)}}})}
    if(window.YT&&window.YT.Player)attach();else{const previous=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(typeof previous==='function')previous();attach()};if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';document.head.appendChild(script)}}
  }
  function prepareMobileVideo(){
    document.body.classList.add('video-standalone');
    const fullscreenButton=document.querySelector('.player-actions .action:first-child');
    fullscreenButton.textContent='⛶ Bekijk op volledig scherm';fullscreenButton.onclick=enterVideoFullscreen;
    const hint=document.createElement('div');hint.className='rotate-hint';hint.innerHTML='<span class="phone-icon">▯</span><span>Draai je gsm voor een groter beeld</span>';playerFrame.appendChild(hint);
    const endScreen=document.createElement('div');endScreen.className='video-end-screen';endScreen.innerHTML='<button type="button">↻ Bekijk opnieuw</button>';endScreen.querySelector('button').onclick=()=>{endScreen.classList.remove('show');if(youtubePlayer){youtubePlayer.seekTo(0);youtubePlayer.playVideo()}};playerFrame.appendChild(endScreen);connectYouTube(endScreen)
  }
  async function enterVideoFullscreen(){const request=playerFrame.requestFullscreen||playerFrame.webkitRequestFullscreen;if(request){try{await request.call(playerFrame);if(screen.orientation&&screen.orientation.lock){try{await screen.orientation.lock('landscape')}catch(error){}}return}catch(error){}}const hint=document.querySelector('.rotate-hint');if(hint){hint.classList.add('attention');hint.querySelector('span:last-child').textContent='Draai je gsm en gebruik de fullscreenknop in de video'}}

  window.hidePlayer=()=>{player.classList.remove('open');frame.src='';current=null;history.replaceState(null,'',location.pathname);renderList()};
  window.fullscreen=()=>{const request=playerFrame.requestFullscreen||playerFrame.webkitRequestFullscreen;if(request)request.call(playerFrame)};
  window.shareCurrent=async()=>{if(!current)return;const url=current.type==='genially'?'https://view.genially.com/'+current.id:location.origin+location.pathname+'?v='+encodeURIComponent(current.id);try{await navigator.clipboard.writeText(url);share.textContent='✓ Gekopieerd';setTimeout(()=>share.textContent='🔗 Deel',2000)}catch(error){prompt('Kopieer deze link:',url)}};
  document.querySelectorAll('.filter').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button));renderList()});
  renderTabs();renderList();
  const video=params.get('v'),genially=params.get('g'),direct=video||genially;
  if(direct){const item=config.items.find(x=>x.id===direct&&x.type===(video?'video':'genially'));if(item){document.body.classList.add('standalone');theme=item.theme;renderTabs();openItem(item);if(video)prepareMobileVideo()}}
})();
