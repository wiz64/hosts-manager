const fs = require('fs');
const path = require('path');
class Hostfile {
    constructor(src) {
        this.src = src;
        this.content = null;
        this.lines = [];
        let raw = fs.readFileSync(this.src, 'utf-8');
        if(raw) {
            this.content = raw;
            this.lines = raw.split('\r\n');
            this.rules = {};
            this.comments = {};
            this.rulesIndex = {};
                // rules = {'127.0.0.1':['xyz.abc.com'],'192.168.0.1':['abc.xyz.com']}
            this.lines.forEach((line, index) => {
                if(!(line.trim) || line.trim() == '') {return;}
                this.lines[index] = line.trim();
                if(line.startsWith('#')) {
                   // line is comment, ignore
                     this.lines[index] = null;
                     console.log('comment line ignored', line)
                     // store it in comments at index
                        this.comments[index] = line;
                }
                else {
                    // combine multi spaces and tabs to one
                    while(this.lines[index].includes('  ') || this.lines[index].includes('\t')) {
                        this.lines[index] = this.lines[index].replace('  ', ' ');
                        this.lines[index] = this.lines[index].replace('\t', ' ');
                    }
                    // line not comment, create rule
                    let line = this.lines[index];
                   if(!this.rules[line.split(' ')[0]]) {
                       this.rules[line.split(' ')[0]] = [];
                   }
                   let ip = line.split(' ')[0];
                   let hostname = line.split(' ')[1];
                   let pos = index;
                     this.rules[ip].push(hostname);
                     this.rulesIndex[pos] = [`${ip} ${hostname}`];
                   }
                
            });
        }
        }

        text() {
                var newContent = [];
                var indexes = {...this.comments, ...this.rulesIndex};
                indexes = Object.keys(indexes).sort((a,b) => a-b);
                    indexes.forEach(index => {
                if(this.comments[index]) {
                    newContent.push(this.comments[index]);
                }
                else {
                    newContent.push(this.rulesIndex[index]);
                }});
                let s = newContent.join('\r\n');
                //console.log('s',s)
                return s;
            }
        
        save() {
            var text = this.text();
            
            console.log('text',text)
            // catch permissions issues
            try {
            fs.writeFileSync(this.src, text);
            }
            catch(e) {
                console.log(e);
            }
        }

        addRule(ip, hostname) {
            if(!this.rules[ip]) {
                this.rules[ip] = [];
            }
            if(this.rules[ip].includes(hostname)) {
                console.log('hostname already exists');
                return;
            }
            this.rules[ip].push(hostname);
            this.rulesIndex[this.lines.length] = [`${ip} ${hostname}`];
            this.lines.push(`${ip} ${hostname}`);
        }
        removeRule(ip, hostname) {
           if(!this.rules[ip]) {
               console.log('ip not found');
               return;
           }
           if(!this.rules[ip].includes(hostname)) {
               console.log('hostname not found');
               return;
           }
              var index = this.rules[ip].indexOf(hostname);
                this.rules[ip].splice(index,1);
                // remove from lines
                var line = `${ip} ${hostname}`;
                var lineIndex = this.lines.indexOf(line);
                this.lines.splice(lineIndex,1);
                // remove from rulesIndex
                var rulesIndex = Object.keys(this.rulesIndex);
                var rulesIndex = rulesIndex.filter(key => this.rulesIndex[key] == line);
                for(var i = 0; i < rulesIndex.length; i++) {
                    delete this.rulesIndex[rulesIndex[i]];
                }
        }

}
module.exports = {Hostfile}
/* var a = new Hostfile('C:\\Windows\\System32\\drivers\\etc\\hosts');
console.log(a.rules)
a.addRule('127.0.0.1','sub1.example.com')
a.addRule('127.0.0.1','sub2.example.com') 
//a.removeRule('127.0.0.1','sub2.example.com')
//a.removeRule('127.0.0.1','sub1.example.com')

a.save() */