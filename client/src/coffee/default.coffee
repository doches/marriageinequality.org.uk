$(document).ready ->
  updateStory()

updateStory = () ->
  $(".story-element").addClass 'fade'
  setTimeout () ->
    $.get("http://labs.texasexpat.net:3097/")
    .done (story) ->
      updateDisplay(story)
    .fail () ->
      updateDisplay(getBackupStory())
    setTimeout () ->
      updateStory()
    , 12000
  , 1000

getBackupStory = () ->
  story = backupStories.shift()
  backupStories.push(story)
  console.log story
  return story

updateDisplay = (story) ->
  femalePartnerOdds = 0.1
  if story.is_female == 1
    story.gender = "female"
  else
    story.gender = "male"
    femalePartnerOdds = 0.9

  if Math.random() < femalePartnerOdds
    story.partner_title = 'wife'
    story.partner_pronoun = 'she'
  else
    story.partner_title = 'husband'
    story.partner_pronoun = 'he'
  if story.part_time != 1
    story.part_time = false
  $("#story").html window.Templates['story'](story)

  outcome =
    answer: 'no'
    extra: true
  salary = story.salary
  if salary > 18600
    salary = 18500 + Number.parseInt(Math.random()*95)
  amount = 16000 + (2.5 * (18600 - salary))
  monthly = salary / 12.0
  months = Number.parseInt(6 + (amount / (monthly * 0.059)))
  years = Number.parseInt(months / 12)
  months = months - (years * 12)
  str = ""
  if years > 0
    str += "#{years} year"
    if years > 1
      str += "s"
  str += " "
  if months > 0
    str += "#{months} month"
    if months > 1
      str += "s"
  $("#more-info").html window.Templates['moreinfo']
    amount: commaify("#{amount}")
    wait: str
    salary: commaify("#{salary}")

  $("#outcome").html window.Templates['outcome'](outcome)
  $(".story-element").removeClass 'fade'

commaify = (str) ->
  n = Number.parseInt str
  thousands = Number.parseInt (n/1000)
  hundreds = n - (thousands * 1000)
  if thousands > 0
    if hundreds < 10
      hundreds = "00#{hundreds}"
    else if hundreds < 100
      hundreds = "0#{hundreds}"
    return "#{thousands},#{hundreds}"
  else
    return "#{hundreds}"
