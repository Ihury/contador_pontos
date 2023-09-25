const hoursByWeekDay = {
  0: "00:00", // domingo
  1: "08:00", // segunda
  2: "08:00", // terça
  3: "09:30", // quarta
  4: "08:00", // quinta
  5: "09:30", // sexta
  6: "08:00", // sábado
};
$(document).ready(function () {
  $("#gerarCampos").click(function () {
    const dateStart = new Date($("#dateStart").val());
    const dateEnd = new Date($("#dateEnd").val());
    const horariosTable = $("#horariosTable tbody");
    horariosTable.empty(); // Limpar a tabela existente

    dateStart.setHours(dateStart.getHours() + 5);
    dateEnd.setHours(dateEnd.getHours() + 5);

    const oneDay = 24 * 60 * 60 * 1000; // Um dia em milissegundos

    let currentDate = dateStart;
    let rowNumber = currentDate.getDate();

    while (currentDate <= dateEnd) {
      const dateString = `${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${(currentDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;

      const newRow = `
      <tr>
        <th scope="row">${dateString}</th>
        <td contenteditable="true" class="gray-bg hour" id="morningIn">00:00</td>
        <td contenteditable="true" class="gray-bg hour" id="morningOut">00:00</td>
        <td contenteditable="true" class="gray-bg hour" id="afternoonIn">00:00</td>
        <td contenteditable="true" class="gray-bg hour" id="afternoonOut">00:00</td>
        <td contenteditable="true" class="gray-bg hour" id="extraIn">00:00</td>
        <td contenteditable="true" class="gray-bg hour" id="extraOut">00:00</td>
        <th class="hour" id="hourTotal">00:00</th>
        <th class="hour" id="hourPropose">${hoursByWeekDay[currentDate.getDay()]
        }</th>
        <th class="hour" id="hourDiff">00:00</th>
      </tr>
    `;

      horariosTable.append(newRow);

      currentDate = new Date(currentDate.getTime() + oneDay);
    }

    setDiffs();

    $(".gray-bg").on("focus", function () {
      if ($(this).text() == "00:00") {
        $(this).text("");
      }
    });

    $(".gray-bg").on("blur", function () {
      if ($(this).text() !== "00:00") {
        $(this).removeClass("gray-bg");
      }
    });

    $(".hour").on("blur", function () {
      if ($(this).text() == "") {
        $(this).text("00:00");
        $(this).addClass("gray-bg");
        $(this).removeClass("wrong")
      }

      if (/^\d{2}:\d{2}$/.test($(this).text())) setTotal($(this));

      calculateTotals();
    });

    $(".hour").on("input", function () {
      const input = $(this);
      const text = input.text();

      if (/^\d{2}:\d{2}$/.test(text)) {
        input.removeClass("wrong");
      } else {
        input.addClass("wrong");
      }
    });
  });

  function setTotal(el) {
    const line = el.parent();

    const morningIn = line.find("#morningIn");
    const morningInTxt = morningIn.text();
    const morningOut = line.find("#morningOut");
    const morningOutTxt = morningOut.text();
    const afternoonIn = line.find("#afternoonIn");
    const afternoonInTxt = afternoonIn.text();
    const afternoonOut = line.find("#afternoonOut");
    const afternoonOutTxt = afternoonOut.text();
    const extraIn = line.find("#extraIn");
    const extraInTxt = extraIn.text();
    const extraOut = line.find("#extraOut");
    const extraOutTxt = extraOut.text();

    const morningTotal = hourDiff(
      morningInTxt,
      morningOutTxt,
      morningIn,
      morningOut
    );
    const afternoonTotal = hourDiff(
      afternoonInTxt,
      afternoonOutTxt,
      afternoonIn,
      afternoonOut
    );
    const extraTotal = hourDiff(
      extraInTxt,
      extraOutTxt,
      extraIn,
      extraOut
    );

    const total = sumHours(morningTotal, afternoonTotal, extraTotal);

    line.find("#hourTotal").text(total);

    calcDiff(line);
  }

  function hourDiff(hourIn, hourOut, elIn, elOut) {
    const hourInArray = hourIn.split(":");
    const hourOutArray = hourOut.split(":");

    const hourInMinutes =
      parseInt(hourInArray[0]) * 60 + parseInt(hourInArray[1]);
    const hourOutMinutes =
      parseInt(hourOutArray[0]) * 60 + parseInt(hourOutArray[1]);

    const diff = hourOutMinutes - hourInMinutes;
    const totalMinutes = diff > 0 ? diff : 0;

    if (diff < 0 && elIn && elOut) {
      elIn.addClass("warn");
      elOut.addClass("warn");
    } else if (elIn && elOut) {
      elIn.removeClass("warn");
      elOut.removeClass("warn");
    }

    return minutesToHours(totalMinutes);
  }

  function sumHours(...hours) {
    const totalHours = hours.reduce((acc, curr) => {
      const accArray = acc.split(":");
      const currArray = curr.split(":");

      const accMinutes =
        parseInt(accArray[0]) * 60 + parseInt(accArray[1]);
      const currMinutes =
        parseInt(currArray[0]) * 60 + parseInt(currArray[1]);

      const totalMinutes = accMinutes + currMinutes;

      return minutesToHours(totalMinutes);
    }, "00:00");

    return totalHours;
  }

  function calcDiff(line) {
    const hourTotal = line.find("#hourTotal").text();
    const hourPropose = line.find("#hourPropose").text();

    const hourTotalMinutes =
      parseInt(hourTotal.split(":")[0]) * 60 +
      parseInt(hourTotal.split(":")[1]);

    const hourProposeMinutes =
      parseInt(hourPropose.split(":")[0]) * 60 +
      parseInt(hourPropose.split(":")[1]);

    const diff = hourTotalMinutes - hourProposeMinutes;

    const hourDiff = minutesToHours(diff);

    line.find("#hourDiff").text(hourDiff);

    if (diff >= 0) {
      line.find("#hourDiff").removeClass("warn");
    } else {
      line.find("#hourDiff").addClass("warn");
    }
  }

  function setDiffs() {
    $("[id=hourDiff]").each(function (i, el) {
      const line = $(el).parent();

      calcDiff(line);
    });
  }

  function calculateTotals() {
    let totalToPayMinutes = 0;
    let totalToReceiveMinutes = 0;

    // Iterar pelas linhas da tabela de horas
    $("#horariosTable tbody tr").each(function () {
      const line = $(this);
      // const hourTotal = line.find("#hourTotal").text();
      // const hourPropose = line.find("#hourPropose").text();
      const hourDiff = line.find("#hourDiff").text();

      // Converter horas para minutos
      const parsedDiff = hourDiff.replace("-", "").split(":");
      const hourDiffMinutes =
        parseInt(parsedDiff[0]) * 60 + parseInt(parsedDiff[1]);

      if (hourDiff.includes("-")) {
        totalToPayMinutes += hourDiffMinutes;
      } else {
        totalToReceiveMinutes += hourDiffMinutes;
      }
    });

    const totalBalanceMinutes = totalToReceiveMinutes - totalToPayMinutes;

    // Atualizar os elementos HTML com os resultados
    $("#totalToPay").text(minutesToHours(totalToPayMinutes));
    $("#totalToReceive").text(minutesToHours(totalToReceiveMinutes));
    $("#totalBalance").text(minutesToHours(totalBalanceMinutes));
  }

  function minutesToHours(totalMinutes) {
    const negative = totalMinutes < 0;

    totalMinutes = Math.abs(totalMinutes);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMinutesRest = totalMinutes % 60;

    return `${negative ? "-" : ""
      }${totalHours.toString().padStart(2, "0")}:${totalMinutesRest.toString().padStart(2, "0")}`;
  }
});