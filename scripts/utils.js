
function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}


Array.prototype.sortOn = function(){
  var dup = this.slice();
  if(!arguments.length) return dup.sort();
  var args = Array.prototype.slice.call(arguments);
  return dup.sort(function(a,b){
    var props = args.slice();
    var prop = props.shift();
    while(a[prop] == b[prop] && props.length) prop = props.shift();
    return a[prop] == b[prop] ? 0 : a[prop] > b[prop] ? -1 : 1;
  });
};