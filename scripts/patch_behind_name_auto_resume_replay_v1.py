#!/usr/bin/env python3
"""TEST-only, fail-closed two-hunk patch for original Behind the Name controller.
The 11+MB index exceeds direct connector upload transport limits; GitHub Actions
applies this tiny, validated change within the checked-out repository.
"""
from pathlib import Path
import subprocess

file=Path("index.html")
expected_sha="98ce92bcaec512c716f0b7e8b8956f0c5259e561"
current_sha=subprocess.check_output(["git","hash-object",str(file)],text=True).strip()
if current_sha != expected_sha:
    raise RuntimeError(f"Refusing patch: unexpected base index blob {current_sha}")

original=file.read_bytes()
text=original.decode("utf-8")
old_group="""function startGroup(key){if(!groups[key])return;syncBalances();currentCategory=key;
 if(!state.sessions[key]){const arr=questions.filter(q=>q.category===key).map(q=>q.id);state.sessions[key]={order:shuffle(arr),index:0};save()}
 if(state.sessions[key].index>=state.sessions[key].order.length){state.sessions[key].index=0;state.sessions[key].order=shuffle(state.sessions[key].order);save()}"""
new_group="""function startGroup(key){if(!groups[key])return;syncBalances();currentCategory=key;
 const chapterQuestions=questions.filter(q=>q.category===key);
 if(!state.sessions[key]){const arr=chapterQuestions.map(q=>q.id);state.sessions[key]={order:shuffle(arr),index:0};save()}
 // Completed chapters replay fresh. Unfinished chapters resume saved question.
 // Mastery, one-time awards and purchased hints are preserved unchanged.
 const completed=chapterQuestions.length>0&&chapterQuestions.every(q=>state.done[q.id]===true);
 const session=state.sessions[key];
 if(completed||session.index>=session.order.length){
  session.index=0;session.order=shuffle(session.order);
  for(const q of chapterQuestions)delete state.wrongChoices[q.id];
  save();
 }"""
old_question=""" active=questions.find(q=>q.id===st.order[st.index]);if(!active){st.index++;save();return nextQuestion()}
 selected=-1;answered=false;hintsUsed={};options=shuffle(active.answers.map((value,index)=>({text:value,correct:index===0})));"""
new_question=""" active=questions.find(q=>q.id===st.order[st.index]);if(!active){st.index++;save();return nextQuestion()}
 // Wrong selections are temporary feedback for the current attempt.
 // Resume/replay never re-displays old wrong answers, but a wrong answer
 // chosen now still stays red until this question is correctly answered.
 if(Object.prototype.hasOwnProperty.call(state.wrongChoices,active.id))delete state.wrongChoices[active.id];
 selected=-1;answered=false;hintsUsed={};options=shuffle(active.answers.map((value,index)=>({text:value,correct:index===0})));"""
for label,needle in [("startGroup",old_group),("nextQuestion",old_question)]:
    count=text.count(needle)
    if count!=1: raise RuntimeError(f"Refusing patch: {label} anchor matches {count} times, expected exactly 1")
new_text=text.replace(old_group,new_group).replace(old_question,new_question)
new_bytes=new_text.encode("utf-8")
if not len(original)<len(new_bytes)<len(original)+2500:
    raise RuntimeError("Refusing patch: unexpected byte size difference")
if new_text.count("const STATE_KEY='bible-unfolded-behind-name-v1'")!=1:
    raise RuntimeError("Refusing patch: Behind the Name original save key changed")
if new_text.count("if(!state.done[active.id])")!=1:
    raise RuntimeError("Refusing patch: one-time reward guard unexpectedly changed")
file.write_bytes(new_bytes)
print(f"Patched {file}: {len(original)} -> {len(new_bytes)} bytes; only 2 exact native controller hunks")
